import { expect, it } from 'bun:test'
import { calcEnding } from '../../src/helper/storyProgression'

it('2nd choice of story with min 3 and max 5 should not end', () => {
    const isEnding = calcEnding(2, 3, 5)
    expect(isEnding).toBe(false)
})

it('5th choice of story with min 3 and max 5 should end', () => {
    const isEnding = calcEnding(5, 3, 5)
    expect(isEnding).toBe(true)
})
