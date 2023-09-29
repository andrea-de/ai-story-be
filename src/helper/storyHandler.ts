import { Story } from "../db/Story";
import {
    newStoryInstruction,
    calcEnding,
    choiceInstruction,
    storyInstruction
} from "./storyProgression";

import { ChatGPTClient } from "../ai/ChatGPTClient";

export default async function handleGetStory(): Promise<Story[]> {
    return await Story.find({})
}

export async function handleGetStoryById({ params: { id } }: { params: { id: string } }): Promise<Story | null> {
    return await Story.findOne({ _id: id })
}

export async function handleGetStoryByTag({ params: { tag } }: { params: { tag: string } }): Promise<Story | null> {
    return await Story.findOne({ tag: tag })
}

interface AtPosition {
    tag: string;
    position: string;
}

export async function handleGetStoryAtPosition({ params }: { params: AtPosition }) {
    const position = params.position.split('-').map(p => parseInt(p))
    const story = await Story.findOne({ tag: params.tag })
    const full = story ? await (story as any).getStory(position) : null
    return full;
}

export async function handleGetActionsAtPosition({ params }: { params: AtPosition }) {
    const position = params.position.split('-').map(p => parseInt(p))
    const story = await Story.findOne({ tag: params.tag })
    const full = story ? await (story as any).getStory(position) : null
    return full;
}

export interface NewStory {
    name: string;
    description: string;
    parts: number;
    choices: number;
    tag?: string;
}

export async function handleCreateStory(params: NewStory) {
    try {
        // Get First Segment
        const [firstSegment, choices] = await ChatGPTClient.newStory('new story description', params.choices);
        
        const choicesDict: { [key: string]: string } = choices.reduce((obj, choice, index) => {
            obj[(index + 1).toString()] = choice;
            return obj;
        }, {} as { [key: string]: string });

        // Persist Story
        const story = new Story({
            tag: params.tag,
            name: params.name,
            prompt: params.description,
            storyLengthMin: params.parts - 1,
            storyLengthMax: params.parts + 1,
            choicesLength: params.choices,
            choices: choicesDict,
            segments: { "0": firstSegment },
        });
        
        await story.save();

        return ['CREATED', firstSegment, choices];

    } catch (error) {
        console.log(error);
        return error;
    }

}

export interface StoryAction {
    id?: string;
    tag?: string;
    position: number[];
    action: number;
}

// Returns ['SUCCESS', nextSegment, nextChoices]
export async function handleStoryAction(params: StoryAction, override = false) {
    try {
        // Check Story
        const story = params.tag ? await Story.findOne({ tag: params.tag }) : await Story.findOne({ _id: params.id })
        if (!story) throw new Error('Request Error: Story incorrect')

        // Check Tree
        const treeExists = await (story as any).checkTree([...params.position, params.action])
        console.log("treeexists: ", treeExists)
        if (!treeExists) throw new Error('Request Error: Story Tree Error')

        // Check next segment exists
        const nextSegment = story ? await (story as any).getSegment([...params.position, params.action]) : null
        if (nextSegment) {
            // Check next choices exist
            const nextChoices = story ? await (story as any).getChoice([...params.position, params.action]) : null
            if (!story) throw new Error('Request Error: Choice incorrect')
            return ['SUCCESS', nextSegment, nextChoices]
        }

        /* MUTATES STORY */
        // authorize story writing/overwriting
        const full = await (story as any).getStory(params.position)
        const choice = await (story as any).getChoice([...params.position, params.action])
        const isEnding = calcEnding(story.storyLengthMin, story.storyLengthMax, params.action)
        const [newSegment, newChoices] = await ChatGPTClient.continue(full, choice, isEnding ? 0 : story.choicesLength);

        // Persist // TODO: check duplicate/override
        (story as any).updateSegment([...params.position, params.action], newSegment)
        if (newChoices) (story as any).updateChoices([...params.position, params.action], newChoices)
        // story.markModified('segments'); SAFER
        await Story.updateOne({ _id: story.id }, { $set: story.toJSON() });

        // Response
        return ['SUCCESS', newSegment, newChoices]

    } catch (error) {
        console.log(error)
        return error
    }
}