export function newStoryInstruction(description: string, min: number, max: number, choices: number): string {
    return 'chatgpt new story prompt'
}

export function storyInstruction(full: string, choice: string, isEnding: boolean): string {
    return 'chatgpt new segment prompt'
}

export function prompts(full: string, choice: string, choices: number): string {
    return 'chatgpt new segment prompt'
}

export function choiceInstruction(full: string, segment: string, choices: number): string {
    return 'chatgpt choices prompt'
}


export function calcEnding(depth: number, min: number, max: number) {
    // eg (5 - 2) / (6 - 2) = 3/4 = .75 
    const ending = (depth == max) ? 1 :
        (depth < min) ? 0 :
            (depth - min) / (max - min);

    // eg (random < .75) is likely to end
    const isEnding: boolean = Math.random() < ending;
    if (isEnding) return true;
    return false;
    // ['Continue Story', 'More choices']
}