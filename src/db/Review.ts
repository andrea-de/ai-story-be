import * as mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
);

export type Review = mongoose.InferSchemaType<typeof reviewSchema>;
export const Review = mongoose.model('Review', reviewSchema);
// export const Review = mongoose.models['Review'] || mongoose.model('Review', reviewSchema);