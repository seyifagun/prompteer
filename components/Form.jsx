import Link from "next/link";
import { useState, useEffect } from 'react';

const Form = ({ type, post, setPost, submitting, handleSubmit }) => {
  const [qualityScore, setQualityScore] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePromptQuality = async (promptText) => {
    if (!promptText.trim()) {
      setQualityScore(null);
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/prompt/quality-score', {
        method: 'POST',
        body: JSON.stringify({ prompt: promptText })
      });

      const data = await response.json();
      setQualityScore(data);
    } catch (error) {
      console.error('Failed to analyze prompt:', error);
    }
    setIsAnalyzing(false);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      analyzePromptQuality(post.prompt);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [post.prompt]);
  return (
    <section className='w-full max-w-full flex-start flex-col'>
      <h1 className='head_text text-left'>
        <span className='blue_gradient'>{type} Post</span>
      </h1>
      <p className='desc text-left max-w-md'>
        {type} and share amazing prompts with the world, and let your
        imagination run wild with any AI-powered platform
      </p>

      <form
        onSubmit={handleSubmit}
        className='mt-10 w-full max-w-2xl flex flex-col gap-7 glassmorphism'
      >
        <label>
          <span className='font-satoshi font-semibold text-base text-gray-700'>
            Your AI Prompt
          </span>

          <textarea
            value={post.prompt}
            onChange={(e) => setPost({ ...post, prompt: e.target.value })}
            placeholder='Write your post here'
            required
            className='form_textarea'
          />
          {isAnalyzing && (
            <div className='mt-2 text-sm text-gray-500'>Analyzing prompt quality...</div>
          )}
          {qualityScore && (
            <div className='mt-2'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold'>Quality Score:</span>
                <span className={`text-sm ${qualityScore.score >= 0.7 ? 'text-green-500' : qualityScore.score >= 0.4 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {Math.round(qualityScore.score * 100)}%
                </span>
              </div>
              <div className='mt-2 grid grid-cols-2 gap-2'>
                {Object.entries(qualityScore.metrics).map(([metric, score]) => (
                  <div key={metric} className='text-xs'>
                    <span className='font-medium capitalize'>{metric}:</span>
                    <span className={`ml-1 ${score >= 0.7 ? 'text-green-500' : score >= 0.4 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {Math.round(score * 100)}%
                    </span>
                    {score < 0.4 && (
                      <div className='mt-1 text-xs text-gray-600'>
                        {metric === 'specificity' && 'Try adding more specific details about what you want to achieve.'}
                        {metric === 'clarity' && 'Make your instructions clearer and more direct.'}
                        {metric === 'structure' && 'Break down your prompt into clear, logical steps.'}
                        {metric === 'context' && 'Add relevant background information or context for better meaning to your prompt.'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {qualityScore.score < 0.4 && (
                <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
                  <h4 className='text-sm font-medium text-yellow-800'>Suggestions to improve your prompt:</h4>
                  <ul className='mt-2 text-xs text-yellow-700 list-disc list-inside'>
                    <li>Be more specific about your requirements</li>
                    <li>Use clear and concise language</li>
                    <li>Include relevant context or background</li>
                    <li>Structure your prompt with a clear goal</li>
                    <li>Consider adding examples or constraints</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </label>

        <label>
          <span className='font-satoshi font-semibold text-base text-gray-700'>
            Field of Prompt{" "}
            <span className='font-normal'>
              (#product, #webdevelopment, #idea, etc.)
            </span>
          </span>
          <input
            value={post.tag}
            onChange={(e) => setPost({ ...post, tag: e.target.value })}
            type='text'
            placeholder='#Tag'
            required
            className='form_input'
          />
        </label>

        <div className='flex-end mx-3 mb-5 gap-4'>
          <Link href='/' className='text-gray-500 text-sm'>
            Cancel
          </Link>

          <button
            type='submit'
            className={`px-5 py-1.5 text-sm rounded-full text-white ${qualityScore && qualityScore.score < 0.4 ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-orange'}`}
            disabled={submitting || (qualityScore && qualityScore.score < 0.4)}
          >
            {submitting ? `${type}ing...` : type}
          </button>
        </div>
      </form>
    </section>
  );
};

export default Form;
