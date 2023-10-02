import { describe, expect, it, beforeAll, afterAll } from 'bun:test'
import { getChoiceKeysFromPosition, getSegmentKeysFromPosition, objectWithValueInArray } from '../src/db/Story';


describe('Position: SegmentKeys', () => {

    it('[0] should generate ["0"]', async () => {

        const position = [0]
        const segmentKeys: string[] = getSegmentKeysFromPosition(position);

        expect(segmentKeys.length).toBe(1);
        expect(segmentKeys[0]).toBe('0');
    })

    it('[0,1] should generate ["0", "1"]', async () => {
        const position = [0, 1]
        const segmentKeys: string[] = getSegmentKeysFromPosition(position);

        expect(segmentKeys.length).toBe(2);
        expect(segmentKeys[0]).toBe('0');
        expect(segmentKeys[1]).toBe('1');
    })

    it('[1] should generate ["0", "1"]', async () => {
        const position = [1]
        const segmentKeys: string[] = getSegmentKeysFromPosition(position);

        expect(segmentKeys.length).toBe(2);
        expect(segmentKeys[0]).toBe('0');
        expect(segmentKeys[1]).toBe('1');
    })

    it('[0,1,2] should generate ["0", "1", "1-2"]', async () => {
        const position = [0, 1, 2]
        const segmentKeys: string[] = getSegmentKeysFromPosition(position);

        expect(segmentKeys.length).toBe(3);
        expect(segmentKeys[0]).toBe('0');
        expect(segmentKeys[1]).toBe('1');
        expect(segmentKeys[2]).toBe('1-2');
    })

    it('[1,2] should generate ["0", "1", "1-2"]', async () => {
        const position = [1, 2]
        const segmentKeys: string[] = getSegmentKeysFromPosition(position);

        expect(segmentKeys.length).toBe(3);
        expect(segmentKeys[0]).toBe('0');
        expect(segmentKeys[1]).toBe('1');
        expect(segmentKeys[2]).toBe('1-2');
    })

})

describe('Positions: ChoiceKeys', () => {

    it('[0], 3 should generate ["1", "2", "3"]', async () => {

        const position = [0]
        const choices = 3
        const choiceKeys: string[] = getChoiceKeysFromPosition(position, choices);

        expect(choiceKeys.length).toBe(3);
        expect(choiceKeys[0]).toBe('1');
        expect(choiceKeys[1]).toBe('2');
        expect(choiceKeys[2]).toBe('3');
    })

    it('[0, 1], 2 should generate ["1-1", "2-2"]', async () => {
        const position = [0, 1]
        const segmentKeys: string[] = getChoiceKeysFromPosition(position, 2);

        expect(segmentKeys.length).toBe(2);
        expect(segmentKeys[0]).toBe('1-1');
        expect(segmentKeys[1]).toBe('1-2');
    })

    it('[1], 2 should generate ["1-1", "2-2"]', async () => {
        const position = [1]
        const segmentKeys: string[] = getChoiceKeysFromPosition(position, 2);

        expect(segmentKeys.length).toBe(2);
        expect(segmentKeys[0]).toBe('1-1');
        expect(segmentKeys[1]).toBe('1-2');
    })

    it('[0,1,2], 3 should generate ["1-2-1", "1-2-2", "1-2-3"]', async () => {
        const position = [0, 1, 2]
        const segmentKeys: string[] = getChoiceKeysFromPosition(position, 3);

        expect(segmentKeys.length).toBe(3);
        expect(segmentKeys[0]).toBe('1-2-1');
        expect(segmentKeys[1]).toBe('1-2-2');
        expect(segmentKeys[2]).toBe('1-2-3');
    })

    it('[1,2], 3 should generate ["1-2-1", "1-2-2", "1-2-3"]', async () => {
        const position = [1, 2]
        const segmentKeys: string[] = getChoiceKeysFromPosition(position, 3);

        expect(segmentKeys.length).toBe(3);
        expect(segmentKeys[0]).toBe('1-2-1');
        expect(segmentKeys[1]).toBe('1-2-2');
        expect(segmentKeys[2]).toBe('1-2-3');
    })

})