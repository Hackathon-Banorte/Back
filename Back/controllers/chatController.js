import sintetize_response from '../middleware/sintetize_response.js';
import pinecone from '../middleware/connectToPineconeDB.js';
import { embeddText } from '../middleware/embeddText.js';
import { indexExistsInDB } from '../middleware/validateIndex.js';
import "../middleware/transactions.js";
import respuesta_estado_base from "../middleware/estadoBase.js";
import {createNewTransaction} from "../middleware/transactions.js";
import {
    acciones0,
    acciones1,
    acciones2,
    acciones3,
    acciones4,
    acciones5,
    } from "../middleware/AI_Personas/AI_Personas.js";
import { query } from 'express';

export async function consultar_informacion(messages, query, index, personalidad, perfil_de_usuario){
    console.log("Received request to query index.")
    let pineconeIndex;
    try {
        console.log("Index",index);
        
        if (!await indexExistsInDB(index)) {
            return res.status(400).send({error: "Index not found."});
        }
        else{
            pineconeIndex = pinecone.Index(index);
        }
        console.log(await pinecone.describeIndex({indexName: index}));
        const queryVector = await embeddText(query);
        console.log("Query vector generated");
        const queryRequest = {
        vector: await queryVector,
        topK: 10,
        includeValues: false,
        includeMetadata: true,
        };
        console.log("queryRequest:", queryRequest);
        const queryResponse = await pineconeIndex.query({queryRequest});
        console.log(await queryResponse);
        const metadata = [];
        for (let i = 0; i < await queryResponse.matches.length; i++) {
            // Push the metadata and the score
            console.log("Score:", queryResponse.matches[i].score);
            if (queryResponse.matches[i].score > 0.8){
                metadata.push({
                                question: queryResponse.matches[i].metadata.content,
                            });
            }
        }

        // Take the topK results and use them to sintetize a response
        const response = await sintetize_response(messages, metadata,personalidad,perfil_de_usuario);

        return response;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({error: "Error querying index."});
    }
}

export async function estado_base(req, res){
    console.log("Received request to chat.")
    const r = req.body;
    try {
        const messages = r.messages;
        /*messages.push({
            "role": "user",
            "content": r.initial_state
        });*/
        const response = await respuesta_estado_base(messages, r.personalidad);
        const pineconeIndex = pinecone.Index("banorte-productos");
        const queryVector = await embeddText(await response);
        console.log("Query vector generated");
        const queryRequest = {
        vector: await queryVector,
        topK: 10,
        includeValues: false,
        includeMetadata: true,
        indexname: "banorte-productos",
        namespace: "acciones",
        };
        const queryResponse = await pineconeIndex.query({queryRequest});
        var actionsToTake = [];
        for (let i = 0; i < await queryResponse.matches.length; i++) {
            // Push the metadata and the score
            console.log("Score:", queryResponse.matches[i].score);
            if (queryResponse.matches[i].score > 0.78){
                if (queryResponse.matches[i].id == "acciones-7") {
                    // Has to be over 0.85
                    if (queryResponse.matches[i].score > 0.85){
                        actionsToTake.push({
                            content: queryResponse.matches[i].metadata.content,
                            score: queryResponse.matches[i].score,
                            id: queryResponse.matches[i].id,
                        });
                    }
                }
                else{
                    actionsToTake.push({
                                    content: queryResponse.matches[i].metadata.content,
                                    score: queryResponse.matches[i].score,
                                    id: queryResponse.matches[i].id,
                                });
                }
            }
        }
        console.log(actionsToTake);
        let toReturn;
        const actions = {
            "acciones-0": acciones0,
            "acciones-1": acciones1,
            "acciones-2": acciones2,
            "acciones-3": acciones3,
            "acciones-4": acciones4,
            "acciones-5": acciones5,
        }
        if (actionsToTake.length > 0){
            // Is "transfiere" in the query, do action 7. Use regex
            const transferInQuery = messages[messages.length - 1].content.match(/transfiere/);
            if (transferInQuery){
                actionsToTake = [{
                    id: "acciones-7",
                    score: 1,
                }]
            }
            console.log("Action to take:", actionsToTake[0].id)
            console.log("Action to take:", actions[actionsToTake[0].id])
            if (actionsToTake[0].id == "acciones-6"){
                toReturn = await consultar_informacion(messages, response, "banorte-productos", r.personalidad, r.initial_state);
            }
            else if(actionsToTake[0].id == "acciones-7"){
                // Transfer to account, use regex to find the amount
                const amount = messages[messages.length - 1].content.match(/(\d+)/)[0];

                const sender = r.user;
                const receiver = r.user === 1 ? 2 : 1;
                console.log("Transfering", amount, "from", sender, "to", receiver);
                const transaction = await createNewTransaction(amount, sender, receiver);
                toReturn = "Claro, se ha transferido $" + amount + " a la cuenta solicitada.";
            }
            else{
                toReturn = await actions[actionsToTake[0].id](messages, r.personalidad, r.initial_state);
            }
        }else{
            toReturn = response;
        }
        res.status(200).send({message: "Successfully queried index.", actions: actionsToTake, toReturn: toReturn});
    }
    catch (err) {
        console.log(err);
        res.status(500).send({error: "Error retrieving index status."});
    }
}