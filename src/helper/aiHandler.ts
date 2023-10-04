import { ChatGPTClient } from "../ai/ChatGPTClient";

export async function handleGenerateDescription(): Promise<any> {
    try {
        const generated: string = await ChatGPTClient.generateDescription()
        return {
            description: generated
        }
    } catch (error) {
        throw new Error ('Error generating description')
    }
}
