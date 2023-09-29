import mongoose, { Schema } from 'mongoose';

type NewType = boolean;

export const storySchema = new Schema(
    {
        name: { type: String, required: true },
        prompt: { type: String, required: false },
        description: { type: String, required: false }, // redundant??
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
            async getSegment(position: number[]): Promise<string> { // [1,2] -> Returns segment 1-2
                const segmentKey = position.join('-');
                return this.segments[segmentKey]
            },
            async getStory(position: number[]): Promise<string[]> { // [1,2] -> Returns sements 0, 1, and 1-2
                const segmentKeys = positionArrayToStringOrigin(position);
                const segments = segmentKeys.map((key) => this.segments[key]);
                return segments;
            },
            
            async getChoice(position: number[]): Promise<string> { // [1,2,1] -> Returns choice 1-2-1
                const choiceKey = position.join('-')
                return this.choices[choiceKey]
            },
            async getChoices(position: number[]): Promise<string[]> { // [1,2] -> Returns choices 1-2-1, 1-2-2 ... n of choicesLength
                const choiceKey = position.join('-')
                const choices = [] 
                for (let i = 0; i < this.choicesLength; i++){
                    choices.push(this.segments[choiceKey + '-' + (i+1)])
                }
                return choices;
            },
            async updateSegment(position: number[], segment: string[]): Promise<void> {
                const segmentKey = position.join('-');
                this.segments[segmentKey] = segment;
            },
            async updateChoices(position: number[], choices: string[]): Promise<void> {
                for (let i = 0; i < choices.length; i++) {
                    const choiceKey = position.join('-') + '-' + (i+1);
                    this.choices[choiceKey] = choices[i];
                }
            },
            async checkTree(position: number[]): Promise<NewType> { // [1,2] -> Choice 2 segment not expected 
                let check: boolean = true;
                const segmentKeys = [positionArrayToStringOrigin(position).pop()];
                segmentKeys.map((key) => {
                    // @ts-ignore -> can't return undefined 
                    if (this.segments[key]) check = false
                });
                const choiceKeys = positionArrayToString(position);
                choiceKeys.map((key) => {
                    if (this.choices[key] == undefined) check = false
                    else (console.log("CHOICECHECK: ", key, " - ",  this.choices[key]))
                });
                return check;
            },
            async segmentsExists(position: number[]): Promise<NewType> { // [1,2] -> Choice 2 segment expected 
                const segmentKeys = positionArrayToStringOrigin(position);
                segmentKeys.map((key) => {
                    if (this.segments[key]) return false
                });
                return true;
            },
            async choiceExists(position: number[]): Promise<NewType> { // [1,2] -> Choice 2 exists (infers choice 1 seggment exists) 
                const choiceKeys = positionArrayToString(position);
                choiceKeys.map((key) => {
                    if (this.choices[key]) return false
                });
                return true;
            },

        },
    }
);

// storySchema.methods.getStory = async function (position: number[]): Promise<string> {
// return `This is the long story in position:  ${position}`;
// };

export const Story = mongoose.model<Story>('Story', storySchema);
export type Story = mongoose.InferSchemaType<typeof storySchema>;

function positionArrayToStringOrigin(position: number[]): string[] {
    return ['0', ...positionArrayToString(position)]
}

function positionArrayToString(position: number[], withOrigin = false): string[] {
    let segments = [];
    for (let i = 0; i < position.length; i++) {
        let segment = position.slice(0, i + 1).join('-');
        segments.push(segment);
    }
    // console.log("segments: ", segments);
    return segments;
}

// positionArrayToStringOrigin([1, 2]);