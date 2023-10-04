import { LoremIpsum } from "lorem-ipsum";

export class MockAIClient {

    static lorem = new LoremIpsum({
        sentencesPerParagraph: {
            max: 8,
            min: 4
        },
        wordsPerSentence: {
            max: 16,
            min: 4
        }
    });

    apiUrl: string = 'https://api.chatgpt.com';

    static nextSegment = (n: number): string => `Please provide the next segment to continue this story`
    static nextChoices = (n: number): string => `Please provide an ${n} more choices to continue this story`
    static ending = "Please provide an ending to this story"
    static new = "Please provide an introductory paragraph for a new story about the following"

    static async newStory(prompt: string, nextChoices: number): Promise<[string, string[]]> {
        let newStoryInstruction = this.new + '\n\n' + prompt;
        let choicesInstruction: string = this.nextChoices(nextChoices);
        let newStory = await this.sendMessage(newStoryInstruction);
        newStory = 'This is a new story, ' + this.lorem.generateSentences(4);
        let newChoicesInstruction: string = newStory + '\n\n' + choicesInstruction;
        let newChoices = await this.sendMessage(newChoicesInstruction);
        newChoices = `This is the new choice A - ${this.lorem.generateSentences(1)} \n This is the new choice B - ${this.lorem.generateSentences(1)}`
        let newChoicesArray = newChoices.split('\n')
        return [newStory, newChoicesArray]
    }

    static async continue(storyAtPosition: string[], choice: string, nextChoices: number): Promise<[string, string[]]> {
        let story = storyAtPosition.reduce((acc, segment) => acc + '\n\n' + segment, '');
        let segmentInstruction: string = nextChoices ? this.nextSegment(nextChoices) : this.ending;
        let choicesInstruction: string | null = nextChoices ? this.nextChoices(nextChoices) : null;

        let newSegmentInstruction: string = story + '\n\n' + segmentInstruction;
        let newChoicesArray: string[] = [];
        let newSegment = await this.sendMessage(newSegmentInstruction);
        newSegment = 'This is a new segment. ' + this.lorem.generateSentences(3);
        if (choicesInstruction) {
            let newChoicesInstruction: string = story + '\n\n' + newSegment + '\n\n' + choicesInstruction;
            let newChoices = await this.sendMessage(newChoicesInstruction);
            newChoices = `This is the new choice A - ${this.lorem.generateSentences(1)} \n This is the new choice B - ${this.lorem.generateSentences(1)}`
            newChoicesArray = newChoices.split('\n')
        }

        return [newSegment, newChoicesArray]
    }

    private static async sendMessage(message: string): Promise<string> {
        try {
            return '';
        } catch (error) {
            console.error('Error sending request to ChatGPT:', error);
            throw error;
        }
    }


}
