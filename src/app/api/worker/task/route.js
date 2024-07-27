import { Task } from "@/app/model/user";
import { mongoConnect } from "@/app/utils/feature";
import { NextResponse } from "next/server";

export async function PUT(req) {
    const { selectedImageID: id } = await req.json();
    try {
        await mongoConnect();
        const task = await Task.findById({_id:id});
        // const task = await Task.findByIdAndUpdate(
        //     { _id: id },
        //     { $inc: { 'image_url.$[elem].noOfClick': 1 } },
        //     { arrayFilters: [{ 'elem._id': id }], new: true }
        // );
        // console.log(task);
        // if (task.noOfSuggestionsWant == task.noOfClicks) {
        //     task.isCompleted = true;
        // }
        // await task.save();
        return NextResponse.json("helo")
        // return NextResponse.json({ message: `You Earned ${task.amount / (1000000000 * task.noOfSuggestionsWant)}sol`, success: true }, { status: 200 })
    }
    catch (err) {
        return NextResponse.json({ message: `Internal Server error: ${err.message}`, success: false }, { status: 500 })
    }
}