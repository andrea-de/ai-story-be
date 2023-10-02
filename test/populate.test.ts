import { describe, expect, beforeAll, test, afterAll } from 'bun:test'
import { app, connect, disconnect, db } from '../src/index';

const stories = require('./populate.json');

describe('Population', () => {

    beforeAll(async () => {
        await db.deleteTestStories()
    })

    afterAll(async () => {
        await disconnect();
    })

    test('should populate the database wiht new stories', async () => {
        for (const story of stories) {
            await createRequest(story.name, story.description, story.parts, story.choices, story.tag)
                .then(response => expect(response.segments['0']).toBeDefined());
        }

    })

    test('should get back multiple stories', async () => {
        await storiesRequest()
            .then(response => expect(response.length).toBe(4));
    })

});

const createRequest = async (name: string, description: string, parts: number, choices: number, tag: string) => {
    const request = new Request('http://localhost/api/story/new', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            description,
            parts,
            choices,
            tag
        }),
    });
    const response = await app.handle(request);
    return response.json();
};

const storiesRequest = async () => {
    const request = new Request('http://localhost/api/story/');
    const response = await app.handle(request);
    return response.json();
};