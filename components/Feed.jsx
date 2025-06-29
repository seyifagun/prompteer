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
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);

  const fetchPosts = async () => {
    const response = await fetch("/api/prompt");
    const data = await response.json();

    setAllPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filterPrompts = async (searchtext, semantic = false) => {
    if (semantic) {
      try {
        const response = await fetch(`/api/prompt/semantic-search?q=${encodeURIComponent(searchtext)}`);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Semantic search error:', error);
        return [];
      }
    } else {
      const regex = new RegExp(searchtext, "i"); // 'i' flag for case-insensitive search
      return allPosts.filter(
        (item) =>
          regex.test(item.creator.username) ||
          item.tags.some(tag => regex.test(tag)) ||
          regex.test(item.prompt)
      );
    }
  };

  const handleSearchChange = (e) => {
    clearTimeout(searchTimeout);
    setSearchText(e.target.value);

    // debounce method
    setSearchTimeout(
      setTimeout(async () => {
        const searchResult = await filterPrompts(e.target.value, isSemanticSearch);
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
            placeholder={isSemanticSearch ? 'Search for similar prompts' : 'Search for a tag or a username'}
            value={searchText}
            onChange={handleSearchChange}
            required
            className='search_input peer'
          />
        </form>
        <div className='flex items-center gap-2'>
          <label className='flex items-center gap-2 text-sm text-gray-500'>
            <input
              type='checkbox'
              checked={isSemanticSearch}
              onChange={(e) => {
                setIsSemanticSearch(e.target.checked);
                if (searchText) {
                  filterPrompts(searchText, e.target.checked).then(setSearchedResults);
                }
              }}
              className='form-checkbox h-4 w-4 text-blue-600'
            />
            Semantic Search
          </label>
        </div>
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
