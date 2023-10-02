import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors'
import { html } from '@elysiajs/html'
import { MongooseClient } from './db/MongooseClient';
import * as userHandler from './helper/userHandler';
import * as storyHandler from './helper/storyHandler';

export const db = new MongooseClient();
db.connect();

const port = process.env.PORT || 8000;
export const live = 'Hello World'
export const app = new Elysia()
    .use(cors())
    .get('/', () => live)
    .onError(({ code, error }) => {
        Bun.write(Bun.stdout, error + '\n');
        return new Response(JSON.stringify({ ...error, name: "Error", code: code }))
    })

/* Web */
app.group('/', app => app
    .use(html())
    .get('/index', () => Bun.file("./src/web/index.html").text())
    .get('/script.js', () => Bun.file("./src/web/script.js").text())
)

/* User */
app.group('/api/user', app => app
    .get('/', userHandler.handleGetUser)
    .get('/:id', userHandler.handleGetUserById)
)

const CreateScema = {
    body: t.Object({
        name: t.String(),
        description: t.String(),
        parts: t.Number(),
        choices: t.Number(),
        tag: t.Optional(t.String()),
    })
}

const ActionScema = {
    body: t.Object({
        id: t.Optional(t.String()),
        tag: t.String(),
        position: t.String(),
        action: t.Number()
    })
}

/* Story */
app.group('/api/story', app => app

    .get('/', storyHandler.default)
    // .get('/:id', storyHandler.handleGetStoryById)
    .get('/:tag', storyHandler.handleGetStoryByTag)
    .get('/:tag/:position', storyHandler.handleGetStoryAtPosition)

    .post('/new', ({ body }) => storyHandler.handleCreateStory(body), CreateScema)
    .post('/action', ({ body }) => storyHandler.handleStoryAction(body, true, false), ActionScema)
    .post('/action/readonly', ({ body }) => storyHandler.handleStoryAction(body, false, false), ActionScema)
    .post('/action/update', ({ body }) => storyHandler.handleStoryAction(body, true, true), ActionScema)
)

/* Serve */
app.listen(port, () => {
    Bun.write(Bun.stdout, `Listening on localhost:${port}\n`);
})

export const connect = async () => {
    await db.connect()
}

export const disconnect = async () => {
    await db.disconnect()
}

// process.on('SIGINT', () => {
//     db.disconnect();
// });