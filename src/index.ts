import { Elysia } from 'elysia';
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

/* Story */
app.group('/api/story', app => app

    .get('/', storyHandler.default)
    // .get('/:id', storyHandler.handleGetStoryById)
    .get('/:tag', storyHandler.handleGetStoryByTag)


    .get('/:tag/:position', storyHandler.handleGetStoryAtPosition)
    .get('/:tag/:position/choices', storyHandler.handleGetActionsAtPosition)
    
    // CREATE STORY
    .post('/new', ({body}) => { 
        const params: storyHandler.NewStory = body as storyHandler.NewStory;
        return storyHandler.handleCreateStory(params);
    })

    // SENDS ACTION
    .post('/action', ({body}) => { 
        const params: storyHandler.StoryAction = body as storyHandler.StoryAction;
        return storyHandler.handleStoryAction(params);
    })
)

/* Serve */
app.listen(port, ()=>{
    console.log(`Listening on localhost:${port}`);
})

export const disconnect = () => {
    db.disconnect()
    process.exit();
}

// process.on('SIGINT', () => {
//     db.disconnect();
// });