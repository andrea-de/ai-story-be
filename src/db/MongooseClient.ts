import * as mongoose from 'mongoose';
import { Story } from './Story';

export class MongooseClient {

    collection = '/llm-story'

    uri = (process.env.DB_URI ||
        "mongodb+srv://" +
        process.env.ATLAS_USERNAME +
        ":" + process.env.ATLAS_PASSWORD +
        "@" + process.env.ATLAS_URI) +
        this.collection; // /test?retryWrites=true&w=majority";


    async connect() {
        try {
            await mongoose.connect(this.uri);
            Bun.write(Bun.stdout, 'Connected to DB\n');
        } catch (error: any) {
            Bun.write(Bun.stdout, error.stack + '\n');
        }
    }

    async disconnect() {
        await mongoose.disconnect();
        Bun.write(Bun.stdout, 'Disonnected to DB\n');
    }

    async deleteTestStories() {
        // Bun.write(Bun.stdout, 'Deleting test stories. \n');
        await Story.deleteMany({ 'tag': { $regex: '.*test-story.*' } });
    }

}