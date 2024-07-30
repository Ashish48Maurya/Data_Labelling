import { checkAuth } from "@/app/utils/feature";
import { User } from "../../model/user";

export async function GET(req) {
    const id = await checkAuth(req);
    if (!id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        await mongoConnect();
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ message: user }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: `Internal Server Error - ${e.message}` }, { status: 500 });
    }
}