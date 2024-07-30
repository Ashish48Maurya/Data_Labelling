import { User } from '@/app/model/user';
import { checkAuth, generateToken, mongoConnect } from '@/app/utils/feature';
import { PublicKey } from '@solana/web3.js';
import { NextResponse } from 'next/server';
import nacl from "tweetnacl";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

            let user = await User.findOne({ address: publicKey });

            if (user) {
                const token = generateToken(user._id);
                const res = NextResponse.json({ data: token, success: true, message: "Login Successful" }, { status: 200 });
                res.cookies.set("token",token,{
                    httpOnly: true,
                })
                return res;
            }
            else {
                user = new User({
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

const client = new S3Client({
    region: process.env.Region,
    credentials: {
        accessKeyId: process.env.AccessKey,
        secretAccessKey: process.env.SecretKey,
    }
});

export async function GET(req) {
    try {
        const id = await checkAuth(req)
        await mongoConnect();
        const userData = await User.findOne({ _id: id });
        if (!userData) {
            return NextResponse.json({ message: "User not found, Login First", success: false }, { status: 404 });
        }
        const randomString = Math.random().toString(36).substring(2, 15);
        const command = new PutObjectCommand({
            Bucket: "aws-cloud-front-error",
            Key: `images/${userData._id}/${Date.now()}-${randomString}.jpg`,
            ContentType: 'image/jpeg'
        });

        const presignedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

        return NextResponse.json({ data: presignedUrl, success: true }, { status: 200 })
    }
    catch (err) {
        return NextResponse.json({ message: `Internal Server Error : ${err.message}`, success: false }, { status: 500 });
    }
}