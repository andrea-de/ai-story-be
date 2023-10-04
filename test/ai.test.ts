import { describe, expect, test, beforeAll, afterAll } from 'bun:test'
import { app, connect, disconnect, db } from '../src/index';

describe('App use-cases', () => {

    afterAll(async () => {
        await disconnect();
    })

    test.skip('Generate string', async () => {
        const response = await app.handle(
            new Request(`http://localhost/api/ai/generate`)
        ).then(res => res.json())
        console.log(response);
        expect(response.description).toBeString()
    })
    
})

