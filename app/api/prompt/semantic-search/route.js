import Prompt from "@models/prompt";
import { connectToDB } from "@utils/database";

function extractKeywords(text) {
  // Common English stop words to filter out
  const stopWords = new Set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
    'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
    'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
    'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
    'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by',
    'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over',
    'under', 'again', 'further', 'then', 'once']);

  // Convert to lowercase and split into words
  const words = text.toLowerCase().split(/\W+/);

  // Filter out stop words and count word frequencies
  const wordFreq = {};
  words.forEach(word => {
    if (word && !stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // Sort by frequency and return top keywords
  return Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

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

  // Return cosine similarity
  return dotProduct / (magnitude1 * magnitude2);
}

function findTopics(prompts) {
  // Combine all prompts text
  const allText = prompts.map(p => p.prompt).join(' ');
  
  // Extract keywords as topics
  return extractKeywords(allText);
}

export const POST = async (request) => {
  try {
    const { searchQuery } = await request.json();
    await connectToDB();

    // Get all prompts
    const allPrompts = await Prompt.find({}).populate('creator');

    // Calculate similarity scores and extract keywords
    const searchResults = allPrompts.map(prompt => {
      const similarity = calculateCosineSimilarity(searchQuery, prompt.prompt);
      const keywords = extractKeywords(prompt.prompt);
      return {
        prompt,
        similarity,
        keywords
      };
    });

    // Sort by similarity score
    const sortedResults = searchResults
      .filter(result => result.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity);

    // Get overall topics from top results
    const topics = findTopics(sortedResults.slice(0, 5).map(r => r.prompt));

    // Prepare response with enhanced information
    const response = {
      results: sortedResults.slice(0, 10).map(({ prompt, similarity, keywords }) => ({
        prompt,
        similarity: Math.round(similarity * 100) / 100,
        keywords
      })),
      topics,
      totalResults: sortedResults.length
    };

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to perform semantic search' }), { status: 500 });
  }
};