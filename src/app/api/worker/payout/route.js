import { PayOut, Worker } from "@/app/model/user";
import { checkAuth, mongoConnect } from "@/app/utils/feature";
import { Connection, Keypair, PublicKey, SystemProgram, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import bs58 from 'bs58';
// import cron from "node-cron"

const connection = new Connection("https://api.devnet.solana.com");

export async function PUT(req) {
    let userData, payOut;

    try {
        const id = await checkAuth(req)
        await mongoConnect();
        userData = await Worker.findOne({ _id: id });

        if (!userData) {
            return NextResponse.json({ message: "User not found,Login First", success: false }, { status: 404 });
        }

        const { publicKey } = await req.json();
        if (!publicKey) {
            return NextResponse.json({ message: "Connect Wallet, Please", success: false }, { status: 404 });
        }


        if (userData.pending_amt == 0) {
            return NextResponse.json({ message: "0 SOL Credited to your Wallet 😂 ", success: true }, { status: 200 });
        }

        userData.locked_amt = userData.pending_amt;
        userData.pending_amt = mongoose.Types.Decimal128.fromString("0");
        await userData.save();

        payOut = new PayOut({
            amount: userData.locked_amt,
            worker: userData._id
        })

        const secretKeyBase58 = process.env.PRIVATE_KEY;
        const secretKeyUint8Array = bs58.decode(secretKeyBase58);
        const keyPair = Keypair.fromSecretKey(secretKeyUint8Array);

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: keyPair.publicKey,
                toPubkey: new PublicKey(publicKey),
                lamports: userData.locked_amt * 1000000000,
            })
        );


        const signature = await sendAndConfirmTransaction(connection, transaction, [keyPair]);
        // const checkTransaction = await connection.getTransaction(signature,{
        //     maxSupportedTransactionVersion: 1
        // });
        // if ((checkTransaction?.meta?.postBalances[1] ?? 0) - (checkTransaction?.meta?.preBalances[1] ?? 0) == userData.locked_amt * 1000000000) {

        if (signature) {
            payOut.status = "success",
                userData.locked_amt = mongoose.Types.Decimal128.fromString("0");
            return NextResponse.json({ message: "Payment Successful", success: true }, { status: 200 });
        } else {
            payOut.status = "failed",
                userData.pending_amt = userData.locked_amt;
            userData.locked_amt = mongoose.Types.Decimal128.fromString("0");
            return NextResponse.json({ message: "Payment Fails, Try again Later", success: false }, { status: 500 });
        }
    } catch (err) {
        payOut.status = "failed";
        userData.pending_amt = userData.locked_amt;
        userData.locked_amt = mongoose.Types.Decimal128.fromString("0");
        return NextResponse.json({ message: `Internal Server Error: ${err.message}`, success: false }, { status: 500 });
    } finally {
        if (userData) await userData.save();
        if (payOut) await payOut.save();
    }
}

// const task = cron.schedule('* * * * *', () => {
//     console.log('running every minute 1, 2, 4 and 5');
// });
// task.start();