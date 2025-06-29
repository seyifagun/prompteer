import Prompt from "@models/prompt";
import { connectToDB } from "@utils/database";

function calculateCosineSimilarity(text1, text2) {
  // Convert texts to lowercase and split into words
  const words1 = text1.toLowerCase().split(/\W+/);
  const words2 = text2.toLowerCase().split(/\W+/);

  // Create word frequency maps
  const freqMap1 = {};
  const freqMap2 = {};
  words1.forEach(word => {
    freqMap1[word] = (freqMap1[word] || 0) + 1;
  });
  words2.forEach(word => {
    freqMap2[word] = (freqMap2[word] || 0) + 1;
  });

  // Get unique words from both texts
  const uniqueWords = new Set([...words1, ...words2]);

  // Calculate dot product and magnitudes
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  uniqueWords.forEach(word => {
    const freq1 = freqMap1[word] || 0;
    const freq2 = freqMap2[word] || 0;
    dotProduct += freq1 * freq2;
    magnitude1 += freq1 * freq1;
    magnitude2 += freq2 * freq2;
  });

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  // Avoid division by zero
  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  // Calculate cosine similarity
  return dotProduct / (magnitude1 * magnitude2);
}

export const GET = async (request) => {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const threshold = 0.3; // Minimum similarity score to consider

  if (!query) {
    return new Response("Search query is required", { status: 400 });
  }

  try {
    await connectToDB();

    // Get all prompts
    const prompts = await Prompt.find({}).populate('creator').populate('likes');

    // Calculate similarity scores and filter results
    const results = prompts
      .map(prompt => ({
        ...prompt.toObject(),
        similarity: calculateCosineSimilarity(query, prompt.prompt)
      }))
      .filter(prompt => prompt.similarity > threshold)
      .sort((a, b) => b.similarity - a.similarity);

    return new Response(JSON.stringify(results), { status: 200 });
  } catch (error) {
    return new Response("Failed to perform semantic search", { status: 500 });
  }
};