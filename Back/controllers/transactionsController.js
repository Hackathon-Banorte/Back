import {getTransactions} from '../middleware/transactions.js';

export async function getTransactionsFromUser(req, res) {
    const r = req.query;
    try{
        const user = r.user;
        const result = await getTransactions(user);
        res.status(200).send(result);
    }
    catch(err){
        console.log(err);
        res.status(500).send({error: "Error getting transactions."});
    }
}