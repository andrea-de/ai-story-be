import { describe, expect, it, beforeAll, afterAll } from 'bun:test'
import { app, disconnect, db } from '../../src/index';

describe('API', () => {

    beforeAll(async () => {
        await db.deleteTestStories()
    })

    afterAll(async () => {
        // await db.deleteTestStory()
        disconnect();
    })

    const tag = 'test-story'

    it('Use case', async () => {
        await createRequest('new story', 'new story description', 4, 2, tag)
        await actionRequest(tag, '0', 1)
        await actionRequest(tag, '1', 2)
        await actionRequest(tag, '1-2', 2)
        await getRequest(tag, '1-2-2')
        .then(response => {
            expect(Object.keys(response.segments)).toContain('0');
            expect(Object.keys(response.segments)).toContain('1');
            expect(Object.keys(response.segments)).not.toContain('1-1');
            expect(Object.keys(response.segments)).toContain('1-2');
            expect(Object.keys(response.segments)).toContain('1-2-2');
            expect(Object.keys(response.choices)).not.toContain('1-1-2-2')
            expect(Object.keys(response.choices)).toContain('1-2-2-1');
            expect(Object.keys(response.choices)).toContain('1-2-2-2');
        })
    })

})

const getRequest = async (tag: string, position: string) => {
    const request = new Request(`http://localhost/api/story/${tag}/${position}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const response = await app.handle(request);
    return response.json();
};

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

const actionRequest = async (tag: string, position: string, action: number) => {
    const request = new Request('http://localhost/api/story/action', {
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
    const response = await app.handle(request);
    return response.json();
};


