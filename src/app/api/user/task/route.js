import { Task, User, Worker } from "@/app/model/user";
import { NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { checkAuth, mongoConnect } from "@/app/utils/feature";


export async function POST(req) {
    try {
        const id = await checkAuth(req)
        await mongoConnect();
        const userData = await (User.findOne({ _id: id }) || Worker.findOne({ _id: id }));
        if (!userData) {
            return NextResponse.json({ message: "User not found,Login First",success:false },{status:404});
        }
        else {
            const { uploadedFileUrls, text, amount, Signature } = await req.json();
            if (!uploadedFileUrls) {
                return NextResponse.json({ message: "All Fields Req", success: false }, { status: 404 });
            }

            const imageUrls = uploadedFileUrls?.map(url => ({
                url,
                noOfClick: 0
            }));


            const task = new Task({
                signature: Signature,
                amount: mongoose.Types.Decimal128.fromString(amount),
                image_url: imageUrls,
                title: text,
                user: userData._id
            })

            await task.save();
            userData.tasks.push(task._id)
            await userData.save();

            const connection = new Connection("https://api.devnet.solana.com");
            const transaction = await connection.getTransaction(Signature, {
                maxSupportedTransactionVersion: 1
            });

            if ((transaction?.meta?.postBalances[1] ?? 0) - (transaction?.meta?.preBalances[1] ?? 0) < 500000000) {
                return NextResponse.json({ message: "Insufficient Amount Paid", success: false }, { status: 411 });
            }

            if (transaction?.transaction.message.getAccountKeys().get(1)?.toString() != process.env.PARENT_WALLET_ADDRESS) {
                return NextResponse.json({ message: "Transaction Sent to Wrong Address 😂", success: false }, { status: 411 });
            }


            if (transaction?.transaction.message.getAccountKeys().get(0)?.toString() != userData.address) {
                return NextResponse.json({ message: "Sender's Address doesn't matched with your address, I think u are trying to Hack EarnAsUGo", success: false }, { status: 411 });
            }

            return NextResponse.json({ message: "Task Submitted", success: true, data: task }, { status: 201 })
        }
    } catch (error) {
        return NextResponse.json({ message: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
}