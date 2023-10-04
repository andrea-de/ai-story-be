import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors'
import { html } from '@elysiajs/html'
import { MongooseClient } from './db/MongooseClient';
import * as userHandler from './helper/userHandler';
import * as storyHandler from './helper/storyHandler';
import * as aiHandler from './helper/aiHandler';
import chalk from 'chalk';

export const db = new MongooseClient();
db.connect();

const port = process.env.PORT || 8000;
export const live = 'Hello World'
export const app = new Elysia()
    .use(cors())
    .get('/', () => live)
    .onError(({ error }) => {
        if (error.name === 'Error') return error
        Bun.write(Bun.stdout, chalk.red(error) + '\n');
        return { error: error.name } //
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

/* GPT */
app.group('/api/ai', app => app
    .get('/generate', aiHandler.handleGenerateDescription)
)

/* Story */
app.group('/api/story', app => app
    .get('/', storyHandler.handleGetAllStories)
    // .get('/:id', storyHandler.handleGetStoryById)
    .get('/tag/:tag', storyHandler.handleGetStoryByTag)
    .get('/tag/:tag/:position', storyHandler.handleGetStoryAtPosition)
    .get('/random', storyHandler.handleGetRandomStory)
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