import { useState, useEffect } from 'react';
import { MdPlayArrow, MdDownload, MdStar, MdCalendarToday, MdImage } from 'react-icons/md';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      // Initialize with first 12 posts
      setDisplayedPosts(posts.slice(0, 12));
      setCurrentIndex(12);
    }
  }, [posts]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMorePosts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [posts, displayedPosts, currentIndex]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/posts`);
      const data = await response.json();
      
      if (response.ok) {
        setPosts(data.posts);
      } else {
        setError(data.message || 'Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Network error while fetching posts');
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = () => {
    if (posts.length === 0) return;

    const nextBatch = [];
    let newIndex = currentIndex;

    // Load 12 more posts
    for (let i = 0; i < 12; i++) {
      if (newIndex >= posts.length) {
        newIndex = 0; // Start over from beginning
      }
      nextBatch.push(posts[newIndex]);
      newIndex++;
    }

    setDisplayedPosts(prev => [...prev, ...nextBatch]);
    setCurrentIndex(newIndex);
  };

  const renderPostGrid = () => {
    const grids = [];
    for (let i = 0; i < displayedPosts.length; i += 12) {
      const gridPosts = displayedPosts.slice(i, i + 12);
      grids.push(
        <div key={i} className="grid grid-cols-3 grid-rows-4 gap-4 h-[1200px] mb-8">
          {gridPosts.map((post, index) => (
            <div key={`${post._id}-${i}-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-200">
                {post.thumbnail ? (
                  <img
                    src={`/uploads/${post.thumbnail.filename}`}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : post.photoLink ? (
                  <img
                    src={post.photoLink}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-500" style={{ display: post.thumbnail || post.photoLink ? 'none' : 'flex' }}>
                  <MdImage className="h-12 w-12" />
                </div>
                
                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <button className="opacity-0 hover:opacity-100 transition-opacity duration-300 bg-red-600 text-white rounded-full p-3 hover:bg-red-700">
                    <MdPlayArrow className="h-8 w-8" />
                  </button>
                </div>
              </div>

              {/* Post details */}
              <div className="p-4">
                <h3 className="font-bold text-lg line-clamp-1 mb-2">{post.title}</h3>
                {post.cast && (
                  <p className="text-sm text-gray-600 line-clamp-1 mb-1">{post.cast}</p>
                )}
                {post.quality && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{post.quality}</span>
                  </div>
                )}
                {post.description && (
                  <p className="text-sm text-gray-700 line-clamp-2">{post.description}</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="px-4 pb-4">
                <div className="flex gap-2">
                  {post.downloadLink && (
                    <button 
                      onClick={() => window.open(post.downloadLink, '_blank')}
                      className="bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                      title="Download"
                    >
                      <MdDownload className="h-4 w-4" />
                    </button>
                  )}
                  {post.photoLink && (
                    <button 
                      onClick={() => window.open(post.photoLink, '_blank')}
                      className="bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      title="View Photo"
                    >
                      <MdImage className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return grids;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={fetchPosts}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">The Cinephile TV</h1>
          <p className="text-lg text-gray-600">Discover amazing movies and shows</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">No posts available</p>
              <p>Upload some content or create sample posts to get started!</p>
            </div>
          </div>
        ) : (
          <>
            {renderPostGrid()}

            {/* Loading indicator */}
            {posts.length > 0 && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Scroll down to load more posts...
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;