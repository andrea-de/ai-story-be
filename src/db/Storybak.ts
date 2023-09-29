import mongoose, { Model, Schema } from 'mongoose';

export interface Story {
    name: string
    tag?: string
    prompt: string
    choices: object
    segments: object
    storyLengthMin: number
    storyLengthMax: number
    choicesLength: number
    storyWords: number
    choicesWords: number
    completed: number
    finished: boolean
    latest: boolean
    root: string
    user: object
    following: [object]
}

interface StoryMethods {
    getStory(position: number[]): Promise<string>
    getChoice(position: number[]): Promise<string>
    // addSegment(position: number[], segment: string): Promise<void>
    addChoice(position: number[], choice: string[]): Promise<void>
    // complete(position: number[]): string
}

interface PositionDict {
    position: string
    value: string
}

type StoryModel = Model<Story, {}, StoryMethods>;

const storySchema = new Schema<Story, StoryModel, StoryMethods>(
    {
        prompt: { type: String, required: false },
        name: { type: String, required: true },
        tag: { type: String, required: false, unique: true },

        choices: { type: Schema.Types.Mixed, default: {} }, // Makes up story
        segments: { type: Schema.Types.Mixed, default: {} }, // Makes up story

        storyLengthMin: { type: Number, default: 6 }, // Minimum number of stories before the story is finished
        storyLengthMax: { type: Number, default: 6 }, // Maximim number of stories before the story is finished
        choicesLength: { type: Number, default: 2 }, // How many choices per node

        storyWords: { type: Number, default: 50 }, // How many words should be told at the point in the story
        choicesWords: { type: Number, default: 10 }, // How many words should be in a choice

        completed: { type: Number, default: 0 }, // From 0 to 100
        finished: { type: Boolean, default: false }, // are there any unwritten sections
        latest: { type: Boolean, default: false }, // is this unfinished and not the latest of all the stories of the root 

        root: { type: String }, // Root Story
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Owner of story
        following: { type: [mongoose.Schema.Types.ObjectId], ref: 'User' }, // people who saved story
    },
    {
        methods: {
            async getStory(position: number[]): Promise<string> {
                return `This is the long story in position:  ${position}`;
            },
            async getChoice(position: number[]): Promise<string> {
                return `This is the selected choice in this position: ${position} `;
            },
            async addChoice(position: number[], choice: string[]): Promise<void> {
                // Check position free
                // insert
            }
        },
    }
);

storySchema.methods.addSegment = async function(position: number[], segment: string): Promise<void> {
    const segmentKey: string = position.join('-');
    const segments: any = this.segments;
    if (!segments[segmentKey]) {
        segments[segmentKey] = segment;
        await this.save(); // Save the document to persist the changes
    } else {
        throw new Error('Segment already exists');
    }
};

storySchema.methods.myMethod = function () {
    const segmentsFieldValue = this.segments;
    console.log(`Value of segments field: ${segmentsFieldValue}`);
};

export const Story = mongoose.model<Story, StoryModel>('Story', storySchema);
// export type StoryType = mongoose.InferSchemaType<typeof storySchema>;
// export const Story = mongoose.models['Story'] || mongoose.model('Story', storySchema);


if (false) {
    const connect = async () => {
        const uri = "mongodb+srv://" +
            process.env.ATLAS_USERNAME +
            ":" + process.env.ATLAS_PASSWORD +
            "@" + process.env.ATLAS_URI +
            "/llm-story"; // /test?retryWrites=true&w=majority";

        try {
            const db = await mongoose.connect(uri);
            console.log('Connected to DB');
            return db;
        } catch (error) {
            console.log(error);
        }
    }

    const getStory = async () => {
        let story: Story | null = await Story.findOne({});
        if (story) console.log('story: ', story.name);
    }


    const getFullStory = async () => {
        let story = await Story.findOne({})
        if (story != null) {
            console.log('story: ', story.name);
            let fullStory = await story.getStory([1, 2]);
            console.log('full story: ', fullStory);

        }
    }

    const newStory = async () => {
        let story = new Story({
            name: "anotehr story"
        });
        story.save();
        console.log('new story saved');
    }

    const run = async () => {
        const db = await connect();
        try {
            // await newStory();
            await getFullStory();
        } catch (error) {
            console.log(error);
        }
        process.exit();
    }

    run();
}