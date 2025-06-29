import { connectToDB } from '@utils/database';

function calculatePromptQuality(prompt) {
  const metrics = {
    length: calculateLengthScore(prompt),
    specificity: calculateSpecificityScore(prompt),
    clarity: calculateClarityScore(prompt),
    structure: calculateStructureScore(prompt),
    context: calculateContextScore(prompt)
  };

  // Calculate weighted average
  const weights = {
    length: 0.15,
    specificity: 0.25,
    clarity: 0.25,
    structure: 0.15,
    context: 0.2
  };

  const totalScore = Object.keys(metrics).reduce((score, metric) => {
    return score + (metrics[metric] * weights[metric]);
  }, 0);

  return {
    score: Math.round(totalScore * 100) / 100,
    metrics
  };
}

function calculateLengthScore(prompt) {
  const words = prompt.trim().split(/\s+/).length;
  // Ideal length: 10-50 words
  if (words < 5) return 0.3;
  if (words < 10) return 0.7;
  if (words <= 50) return 1.0;
  if (words <= 75) return 0.8;
  return 0.5;
}

function calculateSpecificityScore(prompt) {
  const specificityIndicators = [
    'specific', 'exactly', 'precisely', 'particular',
    'detailed', 'explicit', 'clear', 'define',
    'numbers', 'measurements', 'requirements',
    'example', 'such as', 'specifically', 'following',
    'steps', 'process', 'method', 'approach'
  ];

  const promptLower = prompt.toLowerCase();
  
  // Check for specific details
  const matches = specificityIndicators.filter(word => promptLower.includes(word));
  
  // Check for numerical values
  const hasNumbers = /\d+/.test(promptLower);
  
  // Check for examples
  const hasExamples = promptLower.includes('example') || promptLower.includes('such as') || promptLower.includes('like');
  
  let score = Math.min(1, matches.length / 4);
  if (hasNumbers) score += 0.2;
  if (hasExamples) score += 0.2;
  
  return Math.min(1, score);
}

function calculateClarityScore(prompt) {
  // Check for clear sentence structure
  const sentences = prompt.split(/[.!?]+/).filter(Boolean);
  const hasGoodStructure = sentences.every(sentence => {
    const words = sentence.trim().split(/\s+/);
    return words.length >= 3; // Basic requirement for a complete thought
  });

  // Check for common filler words that might reduce clarity
  const fillerWords = ['maybe', 'perhaps', 'kind of', 'sort of', 'like', 'um', 'uh'];
  const fillerCount = fillerWords.filter(word => prompt.toLowerCase().includes(word)).length;

  return Math.max(0, 1 - (fillerCount * 0.2)) * (hasGoodStructure ? 1 : 0.7);
}

function calculateStructureScore(prompt) {
  // Check for proper capitalization
  const startsWithCapital = /^[A-Z]/.test(prompt.trim());
  
  // Check for proper punctuation
  const hasProperPunctuation = /[.!?]$/.test(prompt.trim());
  
  // Check for balanced structure
  const hasBalancedStructure = !/[!?]{2,}/.test(prompt) && 
                              !/[.]{4,}/.test(prompt);

  // Check for logical separators
  const hasLogicalSeparators = /[,;:]/.test(prompt) || 
                              /\d[.)]\s/.test(prompt) || // numbered lists
                              /(first|second|third|finally|then|next)/.test(prompt.toLowerCase());

  // Check for paragraphs or clear sections
  const hasStructuredSections = prompt.split('\n').length > 1;

  return [startsWithCapital, hasProperPunctuation, hasBalancedStructure, hasLogicalSeparators, hasStructuredSections]
    .filter(Boolean).length / 5;
}

function calculateContextScore(prompt) {
  const contextIndicators = [
    'because', 'since', 'as', 'therefore',
    'background', 'context', 'purpose', 'goal',
    'need', 'requirement', 'scenario', 'situation',
    'use case', 'objective', 'target', 'audience'
  ];

  const promptLower = prompt.toLowerCase();
  
  // Check for context indicators
  const matches = contextIndicators.filter(word => promptLower.includes(word));
  
  // Check for background information
  const hasBackground = promptLower.includes('background') || 
                       /^(given|assuming|considering)/.test(promptLower);
  
  // Check for purpose/goal statements
  const hasPurpose = /(goal|aim|purpose|objective|trying to|want to|need to) (is|are|to)/.test(promptLower);
  
  let score = Math.min(1, matches.length / 3);
  if (hasBackground) score += 0.3;
  if (hasPurpose) score += 0.3;
  
  return Math.min(1, score);
}

export const POST = async (request) => {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }

    const qualityAnalysis = calculatePromptQuality(prompt);
    
    return new Response(JSON.stringify(qualityAnalysis), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to analyze prompt quality' }), { status: 500 });
  }
};