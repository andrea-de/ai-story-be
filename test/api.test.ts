import { describe, expect, it, beforeAll, afterAll } from 'bun:test'
import { app, connect, disconnect, db } from '../src/index';
import { NewStory, StoryAction } from '../src/helper/storyHandler';

describe('API', () => {

    beforeAll(async () => {
        await connect();
    })

    afterAll(async () => {
        await disconnect();
    })

    const tag = 'test-story'
    let story: any = {
        segments: {},
        choices: {}
    }

    it('should create a new story', async () => {
        const response = await app.handle(
            new Request('http://localhost/api/story/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'new story',
                    description: 'new story description',
                    parts: 4,
                    choices: 2,
                    tag: tag
                }),
            })
        ).then(res => res.json())

        expect(response.segments['0']).toBeDefined();
        expect(response.choices['1']).toBeDefined();
        expect(response.choices['2']).toBeDefined();
        story = {
            segments: { ...response.segments },
            choices: { ...response.choices }
        }
    })

    it('should retrieve the new story at position 0', async () => {
        const response = await app.handle(
            new Request(`http://localhost/api/story/${tag}/0`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        ).then(res => res.json())

        expect(response.tag).toEqual(tag);
        expect(response.segments['0']).toEqual(story.segments['0']);
        expect(response.choices['1']).toEqual(story.choices['1']);
        expect(response.choices['2']).toEqual(story.choices['2']);
    })

    it('should continue a new story at position 0 and action 1', async () => {
        const response = await app.handle(
            new Request('http://localhost/api/story/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tag: tag,
                    position: '0',
                    action: 1
                }),
            })
        ).then(res => res.json())

        expect(response.segments['1']).toBeDefined();
        expect(response.choices['1-1']).toBeDefined();
        expect(response.choices['1-2']).toBeDefined();
        story = {
            segments: { ...story.segments, ...response.segments },
            choices: { ...story.choices, ...response.choices }
        }
    })

    it('should not continue a story which is read only', async () => {
        const response = await app.handle(
            new Request('http://localhost/api/story/action/readonly', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tag: tag,
                    position: '0',
                    action: 2
                }),
            })
        ).then(res => res.json())

        expect(response.name).toEqual('Error');
    })

    it('should retrieve a story with existing continuation in readonly', async () => {
        const response = await app.handle(
            new Request('http://localhost/api/story/action/readonly', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tag: tag,
                    position: '0',
                    action: 1
                }),
            })
        ).then(res => res.json())

        expect(response.segments['1']).toBeDefined();
        expect(response.choices['1-1']).toBeDefined();
        expect(response.choices['1-2']).toBeDefined();
    })

    it('should retrieve a story at a position 1', async () => {
        const response = await app.handle(
            new Request(`http://localhost/api/story/${tag}/1`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        ).then(res => res.json())

        expect(response.tag).toEqual(tag);
        expect(response.segments['0']).toEqual(story.segments['0']);
        expect(response.segments['1']).toEqual(story.segments['1']);
        expect(response.choices['1-1']).toEqual(story.choices['1-1']);
        expect(response.choices['1-2']).toEqual(story.choices['1-2']);
    })

    it('should continue a story at position 1 and action 2', async () => {
        const response = await app.handle(
            new Request('http://localhost/api/story/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tag: tag,
                    position: '1',
                    action: 2
                }),
            })
        ).then(res => res.json())

        expect(response.segments['1-2']).toBeDefined();
        expect(response.choices['1-2-1']).toBeDefined();
        expect(response.choices['1-2-2']).toBeDefined();
        story = {
            segments: { ...story.segments, ...response.segments },
            choices: { ...story.choices, ...response.choices }
        }
    })

    it('should retrieve a story at position 1-2', async () => {
        const response = await app.handle(
            new Request(`http://localhost/api/story/${tag}/1-2`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        ).then(res => res.json())

        expect(response.tag).toEqual(tag);
        expect(response.segments['0']).toEqual(story.segments['0']);
        expect(response.segments['1']).toEqual(story.segments['1']);
        expect(response.segments['1-2']).toEqual(story.segments['1-2']);
        expect(response.choices['1-2-1']).toEqual(story.choices['1-2-1']);
        expect(response.choices['1-2-2']).toEqual(story.choices['1-2-2']);
    })

    it('should not continue a story at the incorrect story', async () => {
        const response = await app.handle(
            new Request('http://localhost/api/story/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tag: 'does-not-exist',
                    position: '1',
                    action: 1
                }),
            })
        ).then(res => res.json())

        expect(response.name).toEqual('Error');
    })

    it('should not continue a story at the incorrect position', async () => {
        const response = await app.handle(
            new Request('http://localhost/api/story/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tag: tag,
                    position: '3',
                    action: 1
                }),
            })
        ).then(res => res.json())

        expect(response.name).toEqual('Error');
    })

    it('should not continue a story at the incorrect action', async () => {
        const response = await app.handle(
            new Request('http://localhost/api/story/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tag: tag,
                    position: '1-2',
                    action: 3
                }),
            })
        ).then(res => res.json())

        expect(response.name).toEqual('Error');
    })

})

const actionRequest = async (tag: string, position: string, action: number) => {
    const request = new Request('http://localhost/api/story/action', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tag: tag,
            position: position,
            action: action
        }),
    });
    const response = await app.handle(request);
    return response.json();
};

const makeRequest = async (tag: string, position: string, action: number) => {
    const response = await fetch('http://localhost/api/story/action', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tag,
            position,
            action
        }),
    });

    return response.json();
};