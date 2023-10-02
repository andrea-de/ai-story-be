import { beforeAll, afterAll } from "bun:test";
import { app, connect, disconnect, db } from '../src/index';

beforeAll(async () => {
    await connect();
    await db.deleteTestStories()
})

afterAll(async () => {
    await connect();
    await db.deleteTestStories()
    await disconnect();
})