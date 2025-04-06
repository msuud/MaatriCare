import React, { useState, useEffect } from "react";
import { Search, Clock, Trash2 } from "lucide-react";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

const GlobalHealthCommunity = () => {
  const [postContent, setPostContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [communityPosts, setCommunityPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    console.log("Setting up auth state listener");

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log(
        "Auth state changed:",
        user ? `${user.displayName} (${user.uid})` : "No user"
      );

      if (user) {
        try {
          await user.getIdToken(true);
          console.log("ID token refreshed");
        } catch (error) {
          console.error("Error refreshing token:", error);
        }

        setCurrentUser(user);

        try {
          const userProfileRef = doc(db, "userProfiles", user.uid);
          const userProfileSnap = await getDoc(userProfileRef);

          if (userProfileSnap.exists()) {
            const profileData = userProfileSnap.data();
            setUserProfile(profileData);
            console.log("User profile fetched:", profileData);
          } else {
            console.log("No user profile found in Firestore for:", user.uid);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        console.log("User logged out or no user detected");
        setCurrentUser(null);
        setUserProfile(null);
      }
    });

    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let unsubscribers = [];

    const setupListeners = async () => {
      if (!currentUser) {
        console.log("No current user, clearing posts");
        setCommunityPosts([]);
        setUserPosts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log("Fetching posts for user:", currentUser.uid);

      try {
        const communityPostsQuery = query(
          collection(db, "posts"),
          orderBy("timestamp", "desc")
        );

        const communityUnsubscribe = onSnapshot(
          communityPostsQuery,
          (snapshot) => {
            const postsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            console.log("Community posts fetched:", postsData.length);
            setCommunityPosts(postsData);

            const currentUserPosts = postsData.filter(
              (post) => post.authorId === currentUser.uid
            );
            console.log(
              "Current user posts:",
              currentUserPosts.length,
              "for user:",
              currentUser.uid
            );
            setUserPosts(currentUserPosts);

            setLoading(false);
          },
          (error) => {
            console.error("Error fetching community posts:", error);
            setLoading(false);
          }
        );

        unsubscribers.push(communityUnsubscribe);
      } catch (error) {
        console.error("Error setting up listeners:", error);
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      console.log("Cleaning up post listeners");
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [currentUser?.uid]);

  const handlePostSubmit = async () => {
    if (!postContent.trim() || !currentUser || isSubmitting) return;

    setIsSubmitting(true);
    console.log("Submitting post as user:", currentUser.uid);

    try {
      const userName =
        userProfile?.name ||
        userProfile?.fullName ||
        currentUser.displayName ||
        "Anonymous User";

      const newPost = {
        content: postContent,
        authorId: currentUser.uid,
        authorName: userName,
        timestamp: serverTimestamp(),
      };

      console.log("Creating new post with author name:", userName);
      await addDoc(collection(db, "posts"), newPost);
      console.log("Post added successfully");
      setPostContent("");
    } catch (error) {
      console.error("Error adding post:", error);
      alert("Failed to post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!currentUser || isDeleting) return;

    if (window.confirm("Are you sure you want to delete this post?")) {
      setIsDeleting(true);
      try {
        const postRef = doc(db, "posts", postId);
        await deleteDoc(postRef);
        console.log("Post deleted successfully:", postId);
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete post. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const filteredCommunityPosts = communityPosts.filter(
    (post) =>
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.authorName &&
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-blue-100 relative overflow-hidden px-2 flex justify-center pt-16">
      <div className="absolute inset-0">
        <div className="absolute top-20 right-40 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
        <div className="absolute top-40 left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-6 left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-600 to-blue-800 text-transparent bg-clip-text">
            Global Health Community Of Mothers
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Share your pregnancy experiences and health tips with everyone!
              </h2>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's your health tip or experience?"
                className="w-full p-4 border rounded-lg mb-4"
                rows="4"
              />
              <div className="text-right">
                <button
                  onClick={handlePostSubmit}
                  disabled={!currentUser || !postContent.trim() || isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-pink-400 via-purple-600 to-blue-800 text-white rounded-full hover:opacity-90 border disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
              {!currentUser && (
                <p className="text-sm text-red-500 mt-2">
                  Please sign in to post your experiences.
                </p>
              )}
            </div>

            <div className="relative mb-6">
              <Search
                className="absolute left-3 top-3 text-gray-500"
                size={20}
              />
              <input
                type="text"
                placeholder="Search for relevant posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 px-4 py-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-300"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Community Posts
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <p>Loading posts...</p>
                </div>
              ) : filteredCommunityPosts.length === 0 ? (
                <div className="bg-white rounded-lg p-4 shadow-md text-center">
                  <p>No posts found. Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCommunityPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-lg p-4 shadow-md"
                    >
                      <p className="mb-2 text-gray-800">{post.content}</p>
                      <div className="flex justify-between text-sm text-gray-600">
                        <p>- {post.authorName || "Anonymous User"}</p>
                        <div className="flex items-center space-x-4">
                          {post.timestamp && (
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              <span>
                                {post.timestamp.toDate
                                  ? new Date(
                                      post.timestamp.toDate()
                                    ).toLocaleDateString()
                                  : "Just now"}
                              </span>
                            </div>
                          )}
                          {currentUser && post.authorId === currentUser.uid && (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              disabled={isDeleting}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Delete post"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Your Posts
              </h2>

              {!currentUser ? (
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-blue-800">Sign in to see your posts</p>
                </div>
              ) : loading ? (
                <div className="text-center py-4">
                  <p>Loading your posts...</p>
                </div>
              ) : userPosts.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600">
                    You haven't posted anything yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {userPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-gray-50 rounded-lg p-4 relative"
                    >
                      <p className="mb-2 text-gray-800">{post.content}</p>
                      <div className="flex justify-between items-center">
                        {post.timestamp && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock size={14} className="mr-1" />
                            <span>
                              {post.timestamp.toDate
                                ? new Date(
                                    post.timestamp.toDate()
                                  ).toLocaleDateString()
                                : "Just now"}
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          disabled={isDeleting}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete post"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalHealthCommunity;
