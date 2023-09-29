import { describe, expect, it, test, afterAll } from 'bun:test'
import { app, disconnect } from '../src/index';

const stories = require('./populate.json'); 

describe('Population', () => {

    test
    // .skip
    ('should populate the database', async () => {

        // stories.forEach((story: any)=>console.log(story))
        // return 
        for (const story of stories) {
            const response = await app.handle(
            new Request('http://localhost/api/story/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(story),
            })
            ).then(res => res.json())
            expect(response[0]).toEqual('CREATED');
        }

        disconnect();
    })

    afterAll(async () => {
        disconnect();
    })


});