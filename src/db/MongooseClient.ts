import * as mongoose from 'mongoose';
import { Story } from './Story';

export class MongooseClient {

    uri = "mongodb+srv://" +
        process.env.ATLAS_USERNAME +
        ":" + process.env.ATLAS_PASSWORD +
        "@" + process.env.ATLAS_URI +
        "/llm-story"; // /test?retryWrites=true&w=majority";

    async connect() {
        try {
            await mongoose.connect(this.uri);
            console.log('Connected to DB');
        } catch (error) {
            console.log(error);
        }
    }
    
    async disconnect() {
        await mongoose.disconnect();
        console.log('Disonnected to DB');
    }

    async deleteTestStory() {
        return await Story.deleteMany({ 'tag': 'test-story' });
    }

}