import { Task, User, Worker } from "@/app/model/user";
import { NextResponse } from "next/server";
import nacl from "tweetnacl";
import { Connection } from "@solana/web3.js";
import jwt from "jsonwebtoken"
export async function POST(req) {
    // const { image_url: uploadedFileUrls, title: text, amount, signature } = await req.json();
    // if(!image_url){
    //     return NextResponse.json({message:"All Fields Req", success:false},{status:404});
    // }
    // const task = new Task({

    // })
    // console.log(uploadedFileUrls,
    //     text,
    //     amount,
    //     signature);




    const token = req.headers.get('authorization');
    if (!token) {
        return NextResponse.json({ message: "Unauthorized HTTP, Token not provided" }, { status: 401 });
    }

    const jwtToken = token.replace(/^Bearer\s/, "").trim();

    try {
        const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET);
        const userData = await (User.findOne({ _id: isVerified._id }) || Worker.findOne({ _id: isVerified._id }));
        if (!userData) {
            return NextResponse.json({ message: "User not found" }, { status: 401 });
        }
        else {


            const { signature } = await req.json();
            const connection = new Connection("https://api.devnet.solana.com");
            const transaction = await connection.getTransaction(signature, {
                maxSupportedTransactionVersion: 1
            });

            if ((transaction?.meta?.postBalances[1] ?? 0) - (transaction?.meta?.preBalances[1] ?? 0) < 500000000) {
                return NextResponse.json({ message: "Insufficient Amount Paid", success: false }, { status: 411 });
            }

            if (transaction?.transaction.message.getAccountKeys().get(1)?.toString() != process.env.PARENT_WALLET_ADDRESS) {
                return NextResponse.json({ message: "Transaction Sent to Wrong Address 😂", success: false }, { status: 411 });
            }

            // if (transaction?.transaction.message.getAccountKeys().get(0)?.toString() != user?.address) {
            //     return NextResponse.json({message:"Sender's Address doesn't matched with your address, I think u are trying to Hack EarnAsUGo",success:false},{status:411});
            // }

            return NextResponse.json({ msg: transaction })


        }
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}