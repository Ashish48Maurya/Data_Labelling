import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
export async function mongoConnect() {
    try {
        // await mongoose.connect(process.env.MONGO_URL);
        await mongoose.connect("mongodb://localhost:27017/EarnAsUGo");
        console.log("Connection Successful...");
    } catch (err) {
        console.error(err);
        throw new Error("MongoDB connection error");
    }
}
export const generateToken = (_id) => {
    return jwt.sign({ _id }, process.env.JWT_SECRET);
};