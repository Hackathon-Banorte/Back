import sintetize_response from './sintetize_response.js';
import pinecone from './connectToPineconeDB.js';
import { embeddText } from './embeddText.js';

export async function CLASSIFY_COMMENT(req, res) {
    console.log("Received request to generate text from text.")
    const body = req.body;
    const response = await generateResponse(body);
    console.log("Response generated");
    res.status(response.status).send(response.data.content);
}

export async function EMBEDDTEXT(req, res) {
    console.log("Received request to embedd text.")
    const body = req.body
    let comment;
    try {
        comment = body.comment;
        const response = await embeddText(body.comment);
        res.status(200).send(response);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({error: "Error embedding text"});
    }
}

async function validateIndex (index, dimension) {
    const indexesList = await pinecone.listIndexes();
    console.log(indexesList);
    const list = []
    for (const index of indexesList) {
        list.push(index);
    }
    console.log(list);
    if (!list.includes(index)) {
        console.log("Index not found, creating index.");
        console.log("Creating index", index, "with dimension", dimension);
        await pinecone.createIndex({
            createRequest: {
            name: index,
            dimension: dimension
            },
        });
    }
    console.log("Index validated");
}

export async function VECTORIZE_INPUT(req, res) {
    console.log("Received request to vectorize input.")
    const body = req.body;
    let questions;
    let index;
    let vectors = [];
    let pineconeIndex;
    try {
        index = body.index;
        // Index can only be lowercase letters, and hyphens (-)
        if (!index.match(/^[a-z-]+$/)) {
            return res.status(400).send({error: "Invalid index name, please use only lowercase letters and hyphens (-)."});
        }
        await validateIndex(index, 1536).then(() => {
            pineconeIndex = pinecone.Index(index);
            }
        );

        date = body.date;
        
        questions = body.questions;
        // Validate comments are less than 100
        if (questions.length > 100) {
            res.status(400).send({error: "Too many comments, please send less than 100 comments."});
        }
        
        for (let i = 0; i < questions.length; i++) {
            const response = await embeddText(questions[i].comment);
            vectors.push(response);
        }
        console.log("Vectors generated");
        console.log(await vectors);
        const upsertVectors = []
        for (let i = 0; i < vectors.length; i++) {
            const vector = await vectors[i];
            const id = questions[i].id;
            upsertVectors.push({
                id: id,
                values: vector,
                metadata: {
                    question: questions[i].question,
                    rating: questions[i].rating,
                }
            })
        }
        const upsertRequest = {
            vectors: await upsertVectors,
            namespace: date
        };
        console.log("Upserting vectors");
        console.log(upsertRequest);
        const upsertResponse = await pineconeIndex.upsert({upsertRequest});
        console.log("Upserted vectors");
        res.status(200).send({message: "Successfully vectorized input.", response: upsertResponse});
    }
    catch (err) {
        console.log(err);
        res.status(500).send({error: "Error vectorizing input."});
    }
}

export async function QUERY(req, res){
    console.log("Received request to query index.")
    const req = req.query;
    let query;
    let pineconeIndex;
    let index;
    let topK;
    try {
        index = req.index;
        // Index can only be lowercase letters, and hyphens (-)
        if (!index.match(/^[a-z-]+$/)) {
            return res.status(400).send({error: "Invalid index name, please use only lowercase letters and hyphens (-)."});
        }
        await validateIndex(index, 1536).then(() => {
            pineconeIndex = pinecone.Index(index);
            }
        );
        query = req.query;
        const queryVector = await embeddText(query);
        console.log("Query vector generated");
        topK = req.topK || 1;
        const queryRequest = {
        vector: await queryVector,
        topK: topK,
        includeValues: false,
        includeMetadata: true,
        //namespace: date
        };
        const queryResponse = await pineconeIndex.query({queryRequest});
        
        const metadata = [];
        for (let i = 0; i < queryResponse.matches.length; i++) {
            // Push the metadata and the score
            if (queryResponse.matches[i].score > 0.8){
                metadata.push({
                                question: queryResponse.matches[i].metadata.question,
                                answer: queryResponse.matches[i].metadata.answer,
                            });
            }
        }

        // Take the topK results and use them to sintetize a response
        const response = await sintetize_response(metadata);


        res.status(200).send({message: "Successfully queried index.", response: response});
    }
    catch (err) {
        console.log(err);
        res.status(500).send({error: "Error querying index."});
    }
}
