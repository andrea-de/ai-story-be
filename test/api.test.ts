import { describe, expect, it, afterAll } from 'bun:test'
import { app, disconnect, db } from '../src/index';
import { NewStory, StoryAction } from '../src/helper/storyHandler';

describe('API', () => {

    const tag = 'test-story'
    let firstSegment: string
    let newSegment: string
    let newChoices: string

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

        expect(response[0]).toEqual('CREATED'); // Response
        expect(response[1]).toBeString(); // New Story Segment
        expect(response[2]).toBeArray(); // Choices
        firstSegment = response[1]
    })

    it('should retrieve the new story', async () => {
        const response = await app.handle(
            new Request(`http://localhost/api/story/${tag}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        ).then(res => res.json())
        expect(response.tag).toEqual(tag); // story exists with unique tag name
    })


    it('should continue the story', async () => {
        const response = await app.handle(
            new Request('http://localhost/api/story/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tag: tag,
                    position: [],
                    action: 1
                }),
            })
        ).then(res => res.json())

        expect(response[0]).toEqual('SUCCESS'); // Response
        expect(response[1]).toBeString(); // New Story Segment
        expect(response[2]).toBeArray(); // Choices
        newSegment = response[1]
        newChoices = response[2]
    })

    it('should retrieve a continued story', async () => { // TODO: DEPRACATE TMI for this API
        const response = await app.handle(
            new Request(`http://localhost/api/story/${tag}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        ).then(res => res.json())

        console.log(response)
        expect(response.tag).toEqual(tag); // story exists with unique tag name
        expect(Object.values(response.segments)).toContain(newSegment); // story exists with unique tag name

    })

    it('should not continue a story at the wrong position', async () => {
        const response = await app.handle(
            new Request('http://localhost/api/story/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tag: tag,
                    position: [1, 3],
                    action: 1
                }),
            })
        ).then(res => res.json())

        expect(response.name).toEqual('Error');

    })

    it('should retrieve test story segment at position 0-1', async () => {
        const response = await app.handle(
            new Request(`http://localhost/api/story/${tag}/1`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        ).then(res => res.json())

        console.log(response)
        expect(response.tag).toEqual(tag); // story exists with unique tag name
        expect(response.journey[0]).toEqual(firstSegment); // 
        expect(response.journey[1]).toEqual(newSegment); // 
    })

    it('should retrieve test story choices after choices 0-1', async () => {
        const response = await app.handle(
            new Request(`http://localhost/api/story/${tag}/1/choices`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        ).then(res => res.json())

        console.log(response)
        expect(response.tag).toEqual(tag); // story exists with unique tag name
        expect(response.choices[0]).toEqual(newChoices[0]); // 
        expect(response.choices[1]).toEqual(newChoices[1]); // 
    })

    afterAll(async () => {
        await db.deleteTestStory()
        disconnect();
    })

});