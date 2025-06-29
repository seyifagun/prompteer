"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

const PromptCard = ({ post, handleEdit, handleDelete, handleTagClick }) => {
  // Destructure semantic search properties if they exist
  const { similarity, keywords } = post;
  const { data: session } = useSession();
  const pathName = usePathname();
  const router = useRouter();

  const [copied, setCopied] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const handleProfileClick = () => {
    console.log(post);

    if (post.creator._id === session?.user.id) return router.push("/profile");

    router.push(`/profile/${post.creator._id}?name=${post.creator.username}`);
  };

  const handleCopy = () => {
    setCopied(post.prompt);
    navigator.clipboard.writeText(post.prompt);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLike = async () => {
    if (!session?.user.id) return;

    try {
      const response = await fetch(`/api/prompt/${post._id}/like`, {
        method: 'POST',
        body: JSON.stringify({ userId: session?.user.id })
      });

      if (response.ok) {
        const updatedPrompt = await response.json();
        setLiked(updatedPrompt.likes.includes(session?.user.id));
        setLikeCount(updatedPrompt.likes.length);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    setLiked(post.likes?.includes(session?.user.id));
    setLikeCount(post.likes?.length || 0);
  }, [post.likes, session?.user.id]);

  return (
    <div className='prompt_card'>
      {similarity !== undefined && (
        <div className='mb-4 flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-semibold text-gray-700'>Relevance:</span>
            <span className={`text-sm ${similarity >= 0.7 ? 'text-green-500' : similarity >= 0.4 ? 'text-yellow-500' : 'text-red-500'}`}>
              {Math.round(similarity * 100)}%
            </span>
          </div>
          {keywords && keywords.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {keywords.map((keyword, index) => (
                <span
                  key={index}
                  className='px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full'
                  onClick={() => handleTagClick && handleTagClick(keyword)}
                >
                  #{keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <div className='flex justify-between items-start gap-5'>
        <div
          className='flex-1 flex justify-start items-center gap-3 cursor-pointer'
          onClick={handleProfileClick}
        >
          <Image
            src={post.creator.image}
            alt='user_image'
            width={40}
            height={40}
            className='rounded-full object-contain'
          />

          <div className='flex flex-col'>
            <h3 className='font-satoshi font-semibold text-gray-900'>
              {post.creator.username}
            </h3>
            <p className='font-inter text-sm text-gray-500'>
              {post.creator.email}
            </p>
            </div>
        </div>
        {/* Handle likes */}
        <div
          className={`like_btn cursor-pointer ${liked ? 'text-red-500' : 'text-gray-500'}`}
          onClick={handleLike}
        >
          <Image
            src={liked ? "/assets/icons/heart-filled.svg" : "/assets/icons/heart.svg"}
            alt='like_icon'
            width={12}
            height={12}
          />
          <span className='text-sm ml-1'>{likeCount}</span>
        </div>
        {/* Handle Copy */}
        <div className='flex gap-3 items-center'>
          <div className='copy_btn' onClick={handleCopy}>
          <Image
            src={
              copied === post.prompt
                ? "/assets/icons/tick.svg"
                : "/assets/icons/copy.svg"
            }
            alt={copied === post.prompt ? "tick_icon" : "copy_icon"}
            width={12}
            height={12}
          />
          </div>
        </div>
      </div>

      <p className='my-4 font-satoshi text-sm text-gray-700'>{post.prompt}</p>
      <p
        className='font-inter text-sm blue_gradient cursor-pointer'
        onClick={() => handleTagClick && handleTagClick(post.tag)}
      >
        #{post.tag}
      </p>

      {session?.user.id === post.creator._id && pathName === "/profile" && (
        <div className='mt-5 flex-center gap-4 border-t border-gray-100 pt-3'>
          <p
            className='font-inter text-sm green_gradient cursor-pointer'
            onClick={handleEdit}
          >
            Edit
          </p>
          <p
            className='font-inter text-sm orange_gradient cursor-pointer'
            onClick={handleDelete}
          >
            Delete
          </p>
        </div>
      )}
    </div>
  );
};

export default PromptCard;
