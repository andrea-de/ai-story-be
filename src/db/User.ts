import * as mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
    },
    {
        methods: {
            do() {
            },
        },
    }
);

export const User = mongoose.model<User>('User', userSchema);
export type User = mongoose.InferSchemaType<typeof userSchema>;
// export const User = mongoose.models['User'] || mongoose.model('User', userSchema);
