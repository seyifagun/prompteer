import { connectToDB } from '@utils/database';
import Prompt from '@models/prompt';

export const POST = async (req, { params }) => {
    try {
        await connectToDB();

        const { userId } = await req.json();
        const promptId = params.id;

        const prompt = await Prompt.findById(promptId);

        if (!prompt) {
            return new Response("Prompt not found", { status: 404 });
        }

        const userLikedIndex = prompt.likes.indexOf(userId);
        
        if (userLikedIndex === -1) {
            // User hasn't liked the prompt yet, add like
            prompt.likes.push(userId);
        } else {
            // User already liked the prompt, remove like
            prompt.likes.splice(userLikedIndex, 1);
        }

        await prompt.save();

        return new Response(JSON.stringify(prompt), { status: 200 });
    } catch (error) {
        return new Response("Failed to like/unlike prompt", { status: 500 });
    }
};