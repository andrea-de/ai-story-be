import { describe, expect, it, beforeAll, afterAll } from 'bun:test'
import { app, disconnect, db } from '../../src/index';
import { ChatGPTClient } from '../../src/ai/ChatGPTClient'
import chalk from 'chalk';
import wrapDefault from 'word-wrap';

const example = require('../json/example.json')
const wrap = (str: string) => wrapDefault(str, { width: 70 })

describe('ChatGPT', () => {
    true

    let generated = {
        description: '',
        title: '',
        tag: '',
        segments: [] as string[], // chosen only
        choices: [] as string[], // choicen only
        unchosen: [] as string[]
    }

    const useStatic = true; // manual control run 

    it.skipIf(useStatic)('Generate description', async () => {
        const generatedDescription = await ChatGPTClient.generateDescription()
        expect(generatedDescription).toBeString()
        generated.description = generatedDescription;
    })

    it.skipIf(useStatic)('Generate new story', async () => {
        const [generatedTitle, generatedTag, generatedSegment] = await ChatGPTClient.generateNewStory(generated.description || example.description)
        expect(generatedTitle).toBeString()
        expect(generatedTag).toBeString()
        expect(generatedSegment).toBeString()
        generated.title = generatedTitle;
        generated.tag = generatedTag;
        generated.segments.push(generatedSegment)

    })

    it.skipIf(useStatic)('Generate N number choices which the user can choose after the introduction', async () => {
        const position = 1
        const segments = !useStatic ? generated.segments.slice(0, position) : example.segments.slice(0, position)
        expect(segments.length).toBe(position)
        const numChoices = 2
        const choices = await ChatGPTClient.generateChoices(segments, numChoices)
        expect(choices.length).toBe(numChoices)

        for (let i = 0; i < numChoices; i++) {
            expect(choices[i]).toBeString()
        }
        generated.choices.push(choices[0])
        generated.unchosen.push(choices[1])
    })

    it.skipIf(useStatic)('Generate continuing segment and choices after first choice', async () => {
        const position = 1
        const segments = !useStatic ? generated.segments.slice(0, position) : example.segments.slice(0, position)
        expect(segments.length).toBe(position)
        const choice = generated.choices[0] || example.choices[0]
        expect(choice).toBeString()
        const numChoices = 2

        const [segment, choices] = await ChatGPTClient.generateContinuation(segments, choice, numChoices)

        expect(segment).toBeString()
        generated.segments.push(segment)

        expect(choices.length).toBe(numChoices)
        for (let i = 0; i < numChoices; i++) {
            expect(choices[i]).toBeString()
        }
        generated.choices.push(choices[0])
        generated.unchosen.push(choices[1])
    })

    it.skipIf(useStatic)('Generate continuing segment and choices after second choice', async () => {
        const position = 2
        const segments = !useStatic ? generated.segments.slice(0, position) : example.segments.slice(0, position)
        expect(segments.length).toBe(position)
        const choice = generated.choices[0] || example.choices[0]
        expect(choice).toBeString()
        const numChoices = 2

        const [segment, choices] = await ChatGPTClient.generateContinuation(segments, choice, numChoices)

        expect(segment).toBeString()
        generated.segments.push(segment)

        expect(choices.length).toBe(numChoices)
        for (let i = 0; i < numChoices; i++) {
            expect(choices[i]).toBeString()
        }
        generated.choices.push(choices[0])
        generated.unchosen.push(choices[1])
    })

    it.skipIf(useStatic)('Generate ending segment', async () => {
        const position = 3
        const segments = !useStatic ? generated.segments.slice(0, position) : example.segments.slice(0, position)
        expect(segments.length).toBe(position)
        const choice = generated.choices[0] || example.choices[0]
        expect(choice).toBeString()

        const [segment, choices] = await ChatGPTClient.generateContinuation(segments, choice, 0)

        expect(segment).toBeString()
        expect(choices.length).toBe(0)
        generated.segments.push(segment)
    })

    const printStory = (story: any) => {
        Bun.write(Bun.stdout, '\n\n' + chalk.bold.greenBright('Description recorded: \n\n') + wrap(story.description) + '\n\n');
        Bun.write(Bun.stdout, chalk.bold.greenBright('Story recorded: \n\n'))
        for (let i = 0; i < story.segments.length; i++) {
            if (story.segments[i]) Bun.write(Bun.stdout, wrap(story.segments[i]) + '\n\n')
            if (story.unchosen[i]) Bun.write(Bun.stdout, wrap(chalk.italic.gray.dim(story.choices[i])) + '\n\n')
            if (story.choices[i]) Bun.write(Bun.stdout, wrap(chalk.italic.bold(story.unchosen[i])) + '\n\n')
        }
        console.log(JSON.stringify(story));
    }

    if (useStatic) printStory(example)

    afterAll(() => {
        printStory(generated)
    })

})
