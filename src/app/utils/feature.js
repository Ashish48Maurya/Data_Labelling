import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

const connect = {};
export async function mongoConnect() {
    if (connect.isConnected) {
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGO_URL);
        connect.isConnected = db.connection.readyState;
        console.log("Connection Successful...");
    } catch (err) {
        console.error(err);
        throw new Error("MongoDB connection error");
    }
}
export const generateToken = (_id) => {
    return jwt.sign({ _id }, process.env.JWT_SECRET);
};

export const checkAuth = async (req) => {
    try {
        const isPresent = req.headers.get('cookie')?.includes('token');
        const token = req.headers.get('cookie').split("=")[1];
        if (isPresent) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded._id;
        }
        return null;
    } catch (err) {
        console.error('Token verification failed:', err);
        return null;
    }
};