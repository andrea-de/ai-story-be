import { Story } from "../db/Story";
import { calcEnding } from "./storyProgression";
import { ChatGPTClient } from "../ai/ChatGPTClient";

export async function handleGetAllStoriess(arg0: any): Promise<Story[]> {
    return await Story.find({})
}

// export async function handleGetAllStories({ query }: { query: { page: number, limit: number } }): Promise<Story[]> {
export async function handleGetAllStories({ query }: { query: any }): Promise<Story[]> {
    const skip = (query.page - 1) * query.limit;
    const limit = (Number(query.limit) + 1) // passes one more to 
    return await Story.find({}).skip(skip).limit(limit);
}

export async function handleGetStoryById({ params: { id } }: { params: { id: string } }): Promise<Story | null> {
    return await Story.findOne({ _id: id })
}

export async function handleGetStoryByTag({ params: { tag } }: { params: { tag: string } }): Promise<Story | null> {
    return await Story.findOne({ tag: tag })
}

export async function handleGetRandomStory(arg0: any): Promise<object> {
    const randomStoryTagObject = await Story.aggregate([
        { $sample: { size: 1 } },
        { $project: { _id: 0, tag: 1 } }
    ]);
    return randomStoryTagObject
}

interface AtPosition {
    tag: string;
    position: string;
}

export async function handleGetStoryAtPosition({ params }: { params: AtPosition }) {
    const position = params.position.split('-').map(p => parseInt(p))
    const story = await Story.findOne({ tag: params.tag })
    if (!story) return { error: { name: 'TagInvalid', message: params.tag + ' not found' } };
    const nextPositionExists = await (story as any).checkTree(position)
    if (!nextPositionExists) return { error: { name: 'PositionInvalid', message: params.position + ' not found' } };

    const segments = await (story as any).getStoryAtPosition(position);
    const choices = await (story as any).getChoices(position);

    return {
        name: story.name,
        tag: story.tag,
        segments: segments,
        choices: choices
    };
}

export async function handleGetSegmentAtPosition({ params }: { params: AtPosition }) { // DEPRECATE
    // const position = params.position.split('-').map(p => parseInt(p))
    const story = await Story.findOne({ tag: params.tag })
    const segment = story ? await (story as any).segments[params.position] : null
    return segment;
}

export async function handleGetChoicesAtPosition({ params }: { params: AtPosition }) {
    const position = params.position.split('-').map(p => parseInt(p))
    const story = await Story.findOne({ tag: params.tag })
    const choices = await (story as any).getChoices(position);
    return choices;
}

export interface NewStory {
    description: string;
    parts: number;
    choices: number;
    tag?: string;
}

export interface StoryResponse {
    segments: object
    choices: object
}

class BadRequest extends Error {
    name: string
    message: string
    status: number
    constructor(message: string) {
        super(message);
        this.name = 'Error';
        this.message = 'Bad Request: ' + message;
        this.status = 400
    }
}

export async function handleCreateStory(body: NewStory): Promise<StoryResponse | BadRequest> {
    try {
        // Get First Segment
        const [title, tag, segment, choices] = await ChatGPTClient.newStory(body.description, body.choices);
        const blurb = body.description; // should be received from ai

        const segmentsDict = { "0": segment }
        const choicesDict: { [key: string]: string } = choices.reduce((obj, choice, index) => {
            obj[(index + 1).toString()] = choice;
            return obj;
        }, {} as { [key: string]: string });


        const existing = await Story.findOne({ tag });
        if (existing) return new BadRequest('Request Error: Story already exists with tag: ' + tag)

        // Persist Story
        const story = new Story({
            name: title,
            description: body.description,
            tag: tag,
            blurb: blurb,
            storyLengthMin: body.parts - 1,
            storyLengthMax: body.parts + 1,
            choicesLength: body.choices,
            choices: choicesDict,
            segments: segmentsDict
        });
        await story.save();

        let result = {
            tag: tag,
            segments: segmentsDict,
            choices: choicesDict
        }
        return result

    } catch (error: any) {
        Bun.write(Bun.stdout, error.stack + '\n');
        throw error;
    }

}

export interface StoryAction {
    id?: string;
    tag: string;
    position: string;
    action: number;
}

export async function handleStoryAction(body: StoryAction, write = false, update = false): Promise<StoryResponse | BadRequest> {
    try {
        const tag: string = body.tag
        const position: string = body.position
        const action: number = body.action

        // Validate Story
        const story = await Story.findOne({ tag: tag })
        if (!story) return new BadRequest('Request Error: Incorrect Story')

        // Validate Position
        const positionArray: number[] = position.split('-').map(p => parseInt(p))
        const currentPositionExists = await (story as any).checkTree(positionArray)
        if (!currentPositionExists) return new BadRequest('Request Error: Incorrect Position')

        // Validate Action Exists
        if (action > story.choicesLength) return new BadRequest('Request Error: Incorrect Action')

        // Check next position exists
        const nextPositionArray = [...positionArray, action]
        const nextPositionExists = await (story as any).checkTree(nextPositionArray)

        if (nextPositionExists && !update) { // No existing continuation and not overriding
            const nextSegment = await (story as any).getSegment(nextPositionArray)
            const nextChoices = await (story as any).getChoices(nextPositionArray)
            let result = {
                segments: nextSegment,
                choices: nextChoices
            }
            return result
        } else if (!write) { // Readonly
            // return { name:"Error", error: 'Request Error: Readonly', code: 400 }
            return new BadRequest('Readonly')
            // throw new BadRequestError('Readonly')
            // throw new Error('Request Error: Readonly')
        }

        /* MUTATES STORY */ // Needs to confirm authorization for story writing/overwriting
        const storyAtPositionDict = await (story as any).getStoryAtPosition(positionArray)
        const storyAtPosition: string[] = Object.values(storyAtPositionDict)

        const choice = await (story as any).getChoice([...positionArray, action])
        const isEnding = calcEnding(nextPositionArray.length, story.storyLengthMin, story.storyLengthMax)
        const [newSegment, newChoices] = await ChatGPTClient.continue(storyAtPosition, choice, isEnding ? 0 : story.choicesLength);

        // Persist
        const newSegmentDict = await (story as any).updateSegment(nextPositionArray, newSegment)
        const newChoicesDict = (newChoices) ? await (story as any).updateChoices(nextPositionArray, newChoices) : {}
        // story.markModified('segments'); SAFER
        await Story.updateOne({ _id: story.id }, { $set: story.toJSON() });

        // Response
        let result = {
            segments: { ...newSegmentDict },
            choices: newChoicesDict
        }
        return result
    } catch (error: any) {
        Bun.write(Bun.stdout, error.stack + '\n');
        return error
    }
}
