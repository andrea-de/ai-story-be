import { User } from "../db/User";


export async function handleGetUser() {
    return await User.find();
}
export async function handleGetUserById({ params: { id } }: { params: { id: string } }) {
    return await User.findOne({ _id: id });
}


