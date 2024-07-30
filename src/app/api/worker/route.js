import { Worker } from '@/app/model/user';
import { checkAuth, generateToken, mongoConnect } from '@/app/utils/feature';
import { PublicKey } from '@solana/web3.js';
import { NextResponse } from 'next/server';
import nacl from "tweetnacl";

export async function POST(req) {
    const { publicKey, signature, message } = await req.json();
    if (!publicKey || !signature || !message) {
        return NextResponse.json({ data: "All Fields are Req" }, { status: 404 })
    }
    try {
        const publicKeyBytes = new PublicKey(publicKey).toBytes();
        const messageBytes = new TextEncoder().encode(message); // Assuming message is a string
        const signatureBytes = new Uint8Array(signature.data);

        const result = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
        if (result) {
            await mongoConnect();

            let user = await Worker.findOne({ address: publicKey });

            if (user) {
                const token = generateToken(user._id);
                const res = NextResponse.json({ data: token, success: true, message: "Login Successful" }, { status: 200 });
                res.cookies.set("token",token,{
                    httpOnly: true,
                })
                return res;
                
            }
            else {
                user = new Worker({
                    address: publicKey,
                });

                const newUser = await user.save();
                const token = generateToken(newUser._id);

                const res = NextResponse.json({ data: token, success: true, message: "Login Successful" }, { status: 200 });
                res.cookies.set("token",token,{
                    httpOnly: true,
                })
                return res;
            }
        }
        return NextResponse.json({ message: "Verification Fail", success: false }, { status: 400 })
    }
    catch (err) {
        return NextResponse.json({ message: `Internal Server Error : ${err.message}`, success: false }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await mongoConnect();
        const id = await checkAuth(req)
        const userData = await Worker.findOne({ _id: id });
        if (!userData) {
            return NextResponse.json({ message: "User not found, Login First", success: false }, { status: 404 });
        }
        return NextResponse.json({ data: userData, success: true }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: `Internal Server Error : ${err.message}`, success: false }, { status: 500 });
    }
}