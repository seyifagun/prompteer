"use client";

import { useState, useEffect } from "react";

import PromptCard from "./PromptCard";

const PromptCardList = ({ data, handleTagClick }) => {
  return (
    <div className='mt-16 prompt_layout'>
      {data.map((post) => (
        <PromptCard
          key={post._id}
          post={post}
          handleTagClick={handleTagClick}
        />
      ))}
    </div>
  );
};

const Feed = () => {
  const [allPosts, setAllPosts] = useState([]);

  // Search states
  const [searchText, setSearchText] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchedResults, setSearchedResults] = useState([]);
  const [searchTopics, setSearchTopics] = useState([]);
  const [totalResults, setTotalResults] = useState(0);

  const fetchPosts = async () => {
    const response = await fetch("/api/prompt");
    const data = await response.json();

    setAllPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filterPrompts = async (searchtext) => {
    if (searchtext.trim()) {
      try {
        const response = await fetch('/api/prompt/semantic-search', {
          method: 'POST',
          body: JSON.stringify({ searchQuery: searchtext })
        });
        const data = await response.json();
        setSearchTopics(data.topics);
        setTotalResults(data.totalResults);
        return data.results.map(result => ({
          ...result.prompt,
          similarity: result.similarity,
          keywords: result.keywords
        }));
      } catch (error) {
        console.error('Semantic search error:', error);
        return [];
      }
    } else {
      const regex = new RegExp(searchtext, "i"); // 'i' flag for case-insensitive search
      const filtered = allPosts.filter(
        (item) =>
          regex.test(item.creator.username) ||
          regex.test(item.tag) ||
          regex.test(item.prompt)
      );
      setSearchTopics([]);
      setTotalResults(filtered.length);
      return filtered;
    }
  };

  const handleSearchChange = (e) => {
    clearTimeout(searchTimeout);
    setSearchText(e.target.value);

    // debounce method
    setSearchTimeout(
      setTimeout(async () => {
        const searchResult = await filterPrompts(e.target.value);
        setSearchedResults(searchResult);
      }, 500)
    );
  };

  const handleTagClick = (tagName) => {
    setSearchText(tagName);

    const searchResult = filterPrompts(tagName);
    setSearchedResults(searchResult);
  };

  return (
    <section className='feed'>
      <div className='w-full flex-center flex-col gap-4'>
        <form className='relative w-full flex-center'>
          <input
            type='text'
            placeholder='Search for similar prompts, tags, or usernames'
            value={searchText}
            onChange={handleSearchChange}
            required
            className='search_input peer'
          />
        </form>



        {searchTopics.length > 0 && (
          <div className='w-full mt-4'>
            <h3 className='text-sm font-semibold text-gray-700'>Related Topics:</h3>
            <div className='flex flex-wrap gap-2 mt-2'>
              {searchTopics.map((topic, index) => (
                <span
                  key={index}
                  className='px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full cursor-pointer hover:bg-gray-200'
                  onClick={() => handleTagClick(topic)}
                >
                  #{topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {searchText && (
          <div className='text-sm text-gray-500 mt-2'>
            Found {totalResults} {totalResults === 1 ? 'result' : 'results'}
          </div>
        )}


      </div>

      {/* All Prompts */}
      {searchText ? (
        <PromptCardList
          data={searchedResults}
          handleTagClick={handleTagClick}
        />
      ) : (
        <PromptCardList data={allPosts} handleTagClick={handleTagClick} />
      )}
    </section>
  );
};

export default Feed;
