import { Submission, Task, Worker } from "@/app/model/user";
import { mongoConnect } from "@/app/utils/feature";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";

export async function PUT(req) {
    const token = req.headers.get('authorization');
    if (!token) {
        return NextResponse.json({ message: "Unauthorized HTTP, Token not provided", success: false }, { status: 401 });
    }
    const jwtToken = token.replace(/^Bearer\s/, "").trim();
    const id = new URL(req.url).searchParams.get('id');


    try {
        await mongoConnect();
        const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET);
        const userData = await Worker.findOne({ _id: isVerified._id });
        if (!userData) {
            return NextResponse.json({ message: "User not found,Login First", success: false }, { status: 404 });
        }


        const task = await Task.findOne({ 'image_url._id': id });
        if (task) {
            if (task.isCompleted) {
                return NextResponse.json({
                    message: " Better Luck Next-Time",
                    success: false
                }, { status: 403 });
            }

            const submission = await Submission.findOne({ worker: userData._id, task: task._id });
            if (submission) {
                return NextResponse.json({
                    message: "Task already submitted",
                    success: false
                }, { status: 404 });
            }

            task.image_url.map(img => {
                if (img._id.toString() === id) {
                    img.noOfClick += 1;
                    task.noOfClicks += 1;
                }
            });
            if (task.noOfClicks >= task.noOfSuggestionsWant) {
                task.isCompleted = true;
            }

            const amount = parseFloat(task.amount.toString());
            const noOfSuggestionsWant = task.noOfSuggestionsWant;
            let earnedSol = amount / noOfSuggestionsWant;
            earnedSol = parseFloat(earnedSol.toFixed(8));


            const new_submission = new Submission({
                task: task._id,
                selectedOption: id,
                worker: userData._id
            })

            task.workers.push(userData._id);
            await task.save();
            await new_submission.save();

            userData.submissions.push(new_submission._id);
            userData.pending_amt = mongoose.Types.Decimal128.fromString((parseFloat(userData.pending_amt.toString()) + earnedSol).toFixed(8));
            await userData.save();


            return NextResponse.json({
                data: userData.pending_amt,
                message: `You Earned ${earnedSol}sol`,
                success: true
            }, { status: 200 });
        }
        else {
            return NextResponse.json({ message: "Task not found", success: false }, { status: 404 });
        }
    }
    catch (err) {
        return NextResponse.json({ message: `Internal Server error: ${err.message}`, success: false }, { status: 500 });
    }
}


export async function GET(req) {
    const token = req.headers.get('authorization');
    console.log(token);
    if (!token) {
        return NextResponse.json({ message: "Unauthorized HTTP, Token not provided", success: false }, { status: 401 });
    }
    const jwtToken = token.replace(/^Bearer\s/, "").trim();
    try {
        await mongoConnect();
        const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET);
        const userData = await Worker.findOne({ _id: isVerified._id });
        if (!userData) {
            return NextResponse.json({ message: "User not found,Login First", success: false }, { status: 404 });
        }
        const tasks = await Task.aggregate([
            {
                $match: {
                    isCompleted: false,
                    workers: { $ne: userData._id }
                }
            },
            {
                $project: {
                    signature: 0
                }
            }
        ]);
        return NextResponse.json({ data: tasks, success: true }, { status: 200 });
    }
    catch (err) {
        return NextResponse.json({ message: `Internal Server Error: ${err.message}`, success: false }, { status: 500 })
    }
}