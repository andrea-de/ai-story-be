import { describe, expect, it } from 'bun:test'
import { app, live } from '../src/index';

describe('Elysia', () => {
    it('Live Check', async () => {

        const response = await app.handle(
            new Request('http://localhost/')
        ).then(res => res.text())

        expect(response).toBe(live)

    })
})
