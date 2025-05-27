import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";
import { reviewsApi } from "@/app/api/(reviews)";
import { useAuthStore } from "@/app/store/authStore";

// Type definitions
interface Review {
  id: string;
  userId: string;
  username: string;
  profileImage?: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  isVerified?: boolean;
  helpfulCount?: number;
}

interface RatingDistribution {
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
}

interface ReviewsProps {
  recipeId: string;
  currentUser: any;
  initialReviews?: Review[];
  initialAverageRating?: number;
}

const ReviewsAndRatings: React.FC<ReviewsProps> = ({
  recipeId,
  currentUser,
  initialReviews = [],
  initialAverageRating = 0
}) => {
  // State management

  const { token } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [averageRating, setAverageRating] =
    useState<number>(initialAverageRating);
  const [totalReviews, setTotalReviews] = useState<number>(
    initialReviews.length
  );
  const [ratingDistribution, setRatingDistribution] =
    useState<RatingDistribution>({
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    });
  const [userRating, setUserRating] = useState<number>(0);
  const [userReview, setUserReview] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentUserReview, setCurrentUserReview] = useState<Review | null>(
    null
  );
  useEffect(() => {
    console.log({ currentUserReview });
  }, []);
  // Pagination and sorting
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"rating" | "createdAt" | "helpful">(
    "createdAt"
  );

  // Ref for the sentinel element (for infinite scroll)
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastReviewRef = useRef<HTMLDivElement | null>(null);
  const fetchInitialReviews = async () => {
    setIsLoading(true);
    try {
      // Fetch reviews
      const reviewsPromise = reviewsApi.getReviews(recipeId, {
        sortBy,
        limit: 5
      });

      // In parallel, fetch the user's review if user is logged in
      const userReviewPromise = currentUser
        ? reviewsApi.getUserReviewForRecipe(recipeId, token)
        : Promise.resolve(null);

      // Wait for both to complete
      const [reviewsResponse, userReviewData] = await Promise.all([
        reviewsPromise,
        userReviewPromise
      ]);

      // Handle reviews data
      const formattedReviews: Review[] = reviewsResponse.reviews.map(
        (review) => ({
          id: review._id,
          userId: review.userId,
          username: review.username,
          profileImage: review.profileImage,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          isVerified: review.isVerified,
          helpfulCount: review.helpfulCount
        })
      );

      setReviews(formattedReviews);
      setHasMore(reviewsResponse.hasMore);
      setNextCursor(reviewsResponse.nextCursor);

      // Handle aggregation data
      if (reviewsResponse.aggregation) {
        setAverageRating(reviewsResponse.aggregation.averageRating);
        setTotalReviews(reviewsResponse.aggregation.totalReviews);
        setRatingDistribution(reviewsResponse.aggregation.ratingDistribution);
      }

      // Handle user review if it exists
      if (userReviewData) {
        const formattedUserReview: Review = {
          id: userReviewData._id,
          userId: userReviewData.userId,
          username: userReviewData.username,
          profileImage: userReviewData.profileImage,
          rating: userReviewData.rating,
          comment: userReviewData.comment,
          createdAt: userReviewData.createdAt,
          updatedAt: userReviewData.updatedAt,
          isVerified: userReviewData.isVerified,
          helpfulCount: userReviewData.helpfulCount
        };

        setCurrentUserReview(formattedUserReview);

        // Pre-fill form with user review data
        setUserRating(formattedUserReview.rating);
        setUserReview(formattedUserReview.comment);
      } else {
        // Reset if no user review exists
        setCurrentUserReview(null);
        setUserRating(0);
        setUserReview("");
      }
    } catch (error) {
      toast.error("Failed to load reviews");
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load of reviews and check for user review
  useEffect(() => {
    fetchInitialReviews();
  }, [recipeId, sortBy, currentUser]);
  // Initial load of reviews and check for user review
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch reviews
        const reviewsPromise = reviewsApi.getReviews(recipeId, {
          sortBy,
          limit: 5
        });

        // In parallel, fetch the user's review if user is logged in
        const userReviewPromise = currentUser
          ? reviewsApi.getUserReviewForRecipe(recipeId, token)
          : Promise.resolve(null);

        // Wait for both to complete
        const [reviewsResponse, userReviewData] = await Promise.all([
          reviewsPromise,
          userReviewPromise
        ]);

        // Handle reviews data
        const formattedReviews: Review[] = reviewsResponse.reviews.map(
          (review) => ({
            id: review._id,
            userId: review.userId,
            username: review.username,
            profileImage: review.profileImage,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            isVerified: review.isVerified,
            helpfulCount: review.helpfulCount
          })
        );

        setReviews(formattedReviews);
        setHasMore(reviewsResponse.hasMore);
        setNextCursor(reviewsResponse.nextCursor);

        // Handle aggregation data
        if (reviewsResponse.aggregation) {
          setAverageRating(reviewsResponse.aggregation.averageRating);
          setTotalReviews(reviewsResponse.aggregation.totalReviews);
          setRatingDistribution(reviewsResponse.aggregation.ratingDistribution);
        }

        // Handle user review if it exists
        if (userReviewData) {
          const formattedUserReview: Review = {
            id: userReviewData._id,
            userId: userReviewData.userId,
            username: userReviewData.username,
            profileImage: userReviewData.profileImage,
            rating: userReviewData.rating,
            comment: userReviewData.comment,
            createdAt: userReviewData.createdAt,
            updatedAt: userReviewData.updatedAt,
            isVerified: userReviewData.isVerified,
            helpfulCount: userReviewData.helpfulCount
          };

          setCurrentUserReview(formattedUserReview);

          // Pre-fill form with user review data
          setUserRating(formattedUserReview.rating);
          setUserReview(formattedUserReview.comment);
        } else {
          // Reset if no user review exists
          setCurrentUserReview(null);
          setUserRating(0);
          setUserReview("");
        }
      } catch (error) {
        toast.error("Failed to load reviews");
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [recipeId, sortBy, currentUser]);

  // Set up intersection observer for infinite scrolling
  const lastReviewCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreReviews();
        }
      });

      if (node) {
        lastReviewRef.current = node;
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasMore]
  );

  // Load more reviews for infinite scrolling
  const loadMoreReviews = async () => {
    if (!nextCursor || isLoading) return;

    setIsLoading(true);
    try {
      const response = await reviewsApi.getReviews(recipeId, {
        cursor: nextCursor,
        sortBy,
        limit: 5
      });

      // Transform and append the new reviews
      const formattedReviews: Review[] = response.reviews.map((review) => ({
        id: review._id,
        userId: review.userId,
        username: review.username,
        profileImage: review.profileImage,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        isVerified: review.isVerified,
        helpfulCount: review.helpfulCount
      }));

      setReviews((prev) => [...prev, ...formattedReviews]);
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
    } catch (error) {
      toast.error("Failed to load more reviews");
      console.error("Error loading more reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Change sort order
  const handleSortChange = (newSortBy: "rating" | "createdAt" | "helpful") => {
    if (sortBy === newSortBy) return;
    setSortBy(newSortBy);
    // Reset pagination
    setNextCursor(null);
  };

  // Handle form submission - creating or updating review
  const handleSubmitReview = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to review");
      return;
    }

    // Enhanced validation
    if (!recipeId || !recipeId.trim()) {
      toast.error("Invalid recipe ID");
      console.error("Missing recipeId:", recipeId);
      return;
    }

    if (!userRating || userRating < 1 || userRating > 5) {
      toast.error("Please select a rating from 1 to 5");
      return;
    }

    if (!userReview || !userReview.trim()) {
      toast.error("Please add a comment to your review");
      return;
    }

    if (!token) {
      toast.error("Authentication token missing. Please log in again.");
      // Optionally redirect to login
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting review with:", {
        recipeId,
        rating: userRating,
        comment: userReview.trim()
      });

      if (isEditing && currentUserReview) {
        // Update existing review
        await reviewsApi.updateReview(
          currentUserReview.id,
          recipeId,
          userRating,
          userReview,
          token
        );

        toast.success("Review updated successfully!");
      } else {
        // Create new review
        await reviewsApi.createReview(recipeId, userRating, userReview, token);

        toast.success("Review posted successfully!");
      }

      // Refresh the reviews list
      await fetchInitialReviews();

      // Reset form if not editing
      if (!isEditing) {
        setUserRating(0);
        setUserReview("");
      }

      setShowReviewForm(false);
    } catch (error: any) {
      // Enhanced error handling with detailed logging
      console.error("Review submission error:", error);

      // Extract error message from response if available
      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";

      toast.error(errorMessage);

      // Log additional details for debugging
      if (error.response) {
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a review
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete your review?")) return;

    try {
      await reviewsApi.deleteReview(reviewId, token);

      // Refresh the reviews list
      await fetchInitialReviews();

      toast.success("Review deleted successfully");

      // Reset form and state
      setIsEditing(false);
      setShowReviewForm(false);
      setUserRating(0);
      setUserReview("");
    } catch (error) {
      toast.error("Failed to delete review");
      console.error("Delete error:", error);
    }
  };

//   // Mark review as helpful
//   const handleMarkHelpful = async (reviewId: string) => {
//     try {
//       const updatedReview = await reviewsApi.markReviewHelpful(reviewId, token);

//       // Update review in the local state
//       setReviews(
//         reviews.map((review) =>
//           review.id === reviewId
//             ? { ...review, helpfulCount: (review.helpfulCount || 0) + 1 }
//             : review
//         )
//       );

//       toast.success("Marked as helpful");
//     } catch (error: any) {
//       if (error.response?.status === 400) {
//         toast.error("You already marked this review as helpful");
//       } else {
//         toast.error("Failed to mark review as helpful");
//       }
//       console.error("Error marking review as helpful:", error);
//     }
//   };

console.log({currentUser})
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Get percentage for rating bar
  const getRatingPercentage = (rating: number) => {
    if (totalReviews === 0) return 0;
    return (
      (ratingDistribution[
        rating as unknown as keyof typeof ratingDistribution
      ] /
        totalReviews) *
      100
    );
  };

  return (
    <div className="mt-8 bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Reviews & Ratings</h2>

      {/* Rating summary */}
      <div className="mb-6 pb-6 border-b border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rating overview */}
        {reviews.length > 0 &&  <div>
            <div className="flex items-center mb-4">
              <div className="mr-4">
                <span className="text-4xl font-bold text-white">
                  {averageRating ? averageRating.toFixed(1) : "-"}
                </span>
                <span className="text-gray-400 text-sm ml-1">/ 5</span>
              </div>

              <div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(averageRating || 0)
                          ? "text-yellow-500"
                          : "text-gray-600"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                </div>
              </div>
            </div>
          </div>}

          {/* Rating distribution */}
        {reviews.length > 0 &&    <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <div className="w-4 mr-2 text-gray-300 text-sm">{rating}</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${getRatingPercentage(rating)}%` }}
                  ></div>
                </div>
                <div className="w-8 text-right text-xs text-gray-400">
                  {
                    ratingDistribution[
                      rating as unknown as keyof typeof ratingDistribution
                    ]
                  }
                </div>
              </div>
            ))}
          </div>}
        </div>

        {reviews.length > 0 &&  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          {currentUser && (
            <div className="mt-5">
              <button
                onClick={() => {
                  setShowReviewForm(!showReviewForm);
                  if (currentUserReview) {
                    setIsEditing(true);
                    setUserRating(currentUserReview.rating);
                    setUserReview(currentUserReview.comment);
                  } else {
                    setIsEditing(false);
                    setUserRating(0);
                    setUserReview("");
                  }
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                {currentUserReview ? "Edit Your Review" : "Rate This Recipe"}
              </button>
            </div>
          )}

          {/* Sort filters */}
          <div className="flex space-x-2 text-sm">
            <span className="text-gray-400 flex items-center">Sort by:</span>
            <button
              onClick={() => handleSortChange("createdAt")}
              className={`px-3 py-1 rounded-full ${
                sortBy === "createdAt"
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => handleSortChange("rating")}
              className={`px-3 py-1 rounded-full ${
                sortBy === "rating"
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              Top Rated
            </button>
            {/* <button 
              onClick={() => handleSortChange('helpful')}
              className={`px-3 py-1 rounded-full ${
                sortBy === 'helpful' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Most Helpful
            </button> */}
          </div>
        </div>}
      </div>

      {/* Review Form */}
      {showReviewForm && currentUser && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 pb-6 border-b border-gray-700"
        >
          <div className="bg-gray-700/50 rounded-xl p-5 mb-6">
            <div className="flex items-center mb-4">
              {currentUser.image ? (
                <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                  <Image
                    src={currentUser.image}
                    alt={currentUser.name || currentUser.username || "User"}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-purple-700 flex items-center justify-center mr-3">
                  <span className="text-white font-medium">
                    {(currentUser.name || currentUser.username || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <div className="text-white font-medium">
                {currentUser.name || currentUser.username}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-white mb-2">Your Rating</p>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className="focus:outline-none mr-1"
                  >
                    <svg
                      className={`w-8 h-8 ${
                        star <= userRating
                          ? "text-yellow-500"
                          : "text-gray-500 hover:text-yellow-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </button>
                ))}
                <span className="ml-2 text-white">
                  {userRating ? `${userRating} out of 5` : "Select a rating"}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-white mb-2">Your Review</p>
              <textarea
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={4}
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                placeholder="Share your experience with this recipe..."
              />
            </div>

            <div className="flex justify-between">
              {isEditing && (
                <button
                  onClick={() => handleDeleteReview(currentUserReview!.id)}
                  className="px-5 py-2 bg-red-900/60 hover:bg-red-800 rounded-full text-white transition-colors"
                >
                  Delete Review
                </button>
              )}

              <div className="flex space-x-3 ml-auto">
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={!userRating || isSubmitting}
                  className={`px-5 py-2 rounded-full text-white transition-colors ${
                    userRating && !isSubmitting
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      : "bg-gray-700 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : isEditing
                      ? "Update Review"
                      : "Post Review"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review, index) => {
            console.log({ review });
            // Determine if this is the last element for infinite scrolling
            const isLastElement = index === reviews.length - 1;

            return (
              <motion.div
                key={review.id}
                ref={isLastElement ? lastReviewCallback : null}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-5 rounded-xl ${
                  currentUser && review.userId === currentUser._id
                    ? "bg-purple-900/30 border border-purple-500/30"
                    : "bg-gray-700/30"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    {review.profileImage ? (
                      <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                        <Image
                          src={review.profileImage}
                          alt={review.username}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mr-3">
                        <span className="text-white font-medium">
                          {review.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-1">
                        <h3 className="text-white font-medium">
                          {review.username}
                        </h3>
                        {currentUser && review.userId === currentUser._id && (
                          <span className="text-xs bg-purple-600/50 text-purple-200 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                        {review.isVerified && (
                          <div className="flex flex-col">
                            <span className="text-xs bg-green-600/50 cursor-pointer text-green-200 px-2 py-0.5 rounded-full flex items-center group relative">
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Genuine Review
                              {/* Tooltip that appears on hover */}
                              <div className="absolute bottom-full left-0 mb-2 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-xs text-gray-200 p-2 rounded-md shadow-lg pointer-events-none">
                                <div className="relative">
                                  <p className="mb-1 font-semibold">
                                    Why is this review verified?
                                  </p>
                                  <p className="text-xs">
                                    This reviewer has cooked this recipe through
                                    our meal planning system and marked it as
                                    completed.
                                  </p>
                                  <div className="absolute -bottom-2 left-3 w-3 h-3 bg-gray-900 rotate-45"></div>
                                </div>
                              </div>
                            </span>
                            <span className="text-xs text-green-300/70 ml-5 mt-0.5">
                              Cooked & verified
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? "text-yellow-500"
                                : "text-gray-600"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                        <span className="ml-2 text-sm text-gray-400">
                          {formatDate(review.createdAt)}
                          {review.updatedAt && " (edited)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {currentUser && review.userId === currentUser._id && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setShowReviewForm(true);
                          setIsEditing(true);
                          setUserRating(review.rating);
                          setUserReview(review.comment);
                        }}
                        className="p-1 text-gray-400 hover:text-white"
                        aria-label="Edit review"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-gray-300 whitespace-pre-line mb-3">
                  {review.comment}
                </div>

                {/* Helpful button */}
                {/* {currentUser && review.userId !== currentUser.id && (
                  <button 
                    onClick={() => handleMarkHelpful(review.id)}
                    className="flex items-center text-sm text-gray-400 hover:text-white"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Helpful {review.helpfulCount ? `(${review.helpfulCount})` : ''}
                  </button>
                )} */}
              </motion.div>
            );
          })}

          {/* Loading indicator for infinite scroll */}
          {isLoading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 text-gray-600 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            ></path>
          </svg>
          <p className="text-gray-400 mb-4">
            No reviews yet. Be the first to review!
          </p>
          {currentUser && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsAndRatings;
