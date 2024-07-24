// import jwt from 'jsonwebtoken';
// import { mongoConnect } from '../utils/feature';
// import { NextResponse } from 'next/server';
// import { User } from '../model/user';

// const authMiddleware = async (req) => {
//     const token = req.headers.get('Authorization');

//     if (!token) {
//         return NextResponse.json({ message: "Unauthorized HTTP, Token not provided" });
//     }

//     const jwtToken = token.replace(/^Bearer\s/, "").trim();
    
//     try {
//         await mongoConnect();
//         const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET);
//         const userData = await User.findOne({ _id: isVerified._id }).select({ password: 0 });

//         if (!userData) {
//             return NextResponse.json({ message: "User not found" });
//         }
//         const response = NextResponse.next();
//         response.headers.set('x-user-id', userData._id.toString());
//         return response;
        
//     } catch (error) {
//         console.log(error);
//         return NextResponse.json({ message: "Internal Server Error" });
//     }
// };

// export default authMiddleware;
