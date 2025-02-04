import { ACTIONS_CORS_HEADERS, ActionGetResponse, ActionPostRequest, ActionPostResponse, MEMO_PROGRAM_ID, createPostResponse } from "@solana/actions"
import { ComputeBudgetInstruction, ComputeBudgetProgram, Connection, PublicKey, Transaction, TransactionInstruction, clusterApiUrl } from "@solana/web3.js";
import { url } from "inspector"
import { headers } from "next/headers";

export const GET = (req:Request) => {

    const payload : ActionGetResponse = {
        icon: new URL("/preview.jpg",new URL(req.url).origin).toString(),
        label:"Send Memo to the Chain",
        description:"This is super simple Action",
        title:"Memo Demo"
    };
    return Response.json(payload , {
        headers: ACTIONS_CORS_HEADERS
    });
};

export const OPTIONS = GET;

export const POST = async (req:Request) => {
    try{

        const body: ActionPostRequest = await req.json();

        let account : PublicKey;
        try{
            account = new PublicKey(body.account);
        }catch(err){
            return new Response('Invalid "account" provided',{
                status:400,
                headers: ACTIONS_CORS_HEADERS,
            });
        } 

        const transaction = new Transaction()

        transaction.add(
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports:1000,
            }),


            new TransactionInstruction({
                programId: new PublicKey(MEMO_PROGRAM_ID),
                data: Buffer.from("this is a simple memo message",'utf8'),
                keys:[],
            }),
        );

        transaction.feePayer = account;

        const connection = new Connection(clusterApiUrl("devnet"));
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

        const payload :ActionPostResponse = await createPostResponse({
            fields:{
                transaction
            },
            // signers:[]
        })

        return Response.json(payload, {headers: ACTIONS_CORS_HEADERS})
    } catch(er){
        return Response.json("An unknown error has occurred",{status:400})
    }
}