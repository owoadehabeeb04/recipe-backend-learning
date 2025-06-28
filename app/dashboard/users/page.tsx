"use client";
import React, { useState, useEffect } from "react";
 
import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/app/api/(users)";
import { useAuthStore } from "@/app/store/authStore";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define user type
interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  message: string;
  pagination?: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

const Users = () => {
  const { token, user: currentUser } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const router = useRouter()
  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterRole]);

  // Fetch users with React Query
  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery<UsersResponse>({
    queryKey: ["users", currentPage, limit, debouncedSearchTerm, filterRole],
    queryFn: async () => {
      if (!token) {
        throw new Error("Authentication required");
      }

      // Build query params for pagination, search, and filters
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", limit.toString());

      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }

      if (filterRole !== "all") {
        params.append("role", filterRole);
      }

      // Pass the query string to getAllUsers
      return getAllUsers(token, params.toString());
    },
    enabled: !!token,
    staleTime: 5000 // Keep data fresh for 5 seconds while loading new data
  });

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already handled by the debounced term
    // We don't need to do anything here except prevent default
  };

  // Handle role filter change
  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRole(e.target.value);
    // Page reset is handled in useEffect
  };

  // Generate pagination controls
  // Generate pagination controls
  // Generate pagination controls
  const renderPagination = () => {
    // Safety check for pagination object structure
    if (
      !usersData?.pagination ||
      typeof usersData.pagination.total === "undefined"
    ) {
      console.warn("Missing pagination data:", usersData?.pagination);
      return null;
    }

    // Calculate totalPages if not provided by API
    const { total, limit = 10 } = usersData.pagination;
    const totalPages =
      usersData.pagination.totalPages || Math.ceil(total / limit);

    // Make sure we have a valid currentPage
    const apiCurrentPage = usersData.pagination.currentPage || 1;

    // Use local currentPage state for accurate UI updates during transitions
    const displayedPage = currentPage;

    // Guard against invalid page numbers
    if (displayedPage < 1 || (totalPages > 0 && displayedPage > totalPages)) {
      console.warn(
        "Invalid page number:",
        displayedPage,
        "totalPages:",
        totalPages
      );
      return null;
    }

    // If we have no pages or only one page, don't show pagination
    if (totalPages <= 1) {
      return (
        <div className="text-sm text-gray-400 mt-6">
          Showing {usersData.data.length} of {total} users
        </div>
      );
    }

    // Determine which page numbers to show
    const getPageNumbers = () => {
      const pageNumbers = [];

      // Always show first page
      pageNumbers.push(1);

      // Calculate range around current page
      let rangeStart = Math.max(2, displayedPage - 1);
      let rangeEnd = Math.min(totalPages - 1, displayedPage + 1);

      // Adjust range to always show 3 pages if possible
      if (rangeEnd - rangeStart < 2) {
        if (rangeStart === 2) {
          rangeEnd = Math.min(4, totalPages - 1);
        } else if (rangeEnd === totalPages - 1) {
          rangeStart = Math.max(2, totalPages - 3);
        }
      }

      // Add ellipsis after first page if needed
      if (rangeStart > 2) {
        pageNumbers.push("ellipsis1");
      }

      // Add range pages
      for (let i = rangeStart; i <= rangeEnd; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis before last page if needed
      if (rangeEnd < totalPages - 1) {
        pageNumbers.push("ellipsis2");
      }

      // Always show last page if more than one page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }

      return pageNumbers;
    };

    const pageNumbers = getPageNumbers();

    return (
      <div className="mt-6 flex flex-col items-center space-y-3">
        <div className="flex items-center justify-center">
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(displayedPage - 1)}
            disabled={displayedPage <= 1 || isLoading}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-l-md text-gray-300 bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Prev
          </button>

          {/* Page numbers */}
          <div className="hidden md:flex">
            {pageNumbers.map((page, index) => {
              if (page === "ellipsis1" || page === "ellipsis2") {
                return (
                  <span
                    key={`${page}-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() =>
                    typeof page === "number" && handlePageChange(page)
                  }
                  disabled={isLoading}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                    page === displayedPage
                      ? "bg-purple-600 border-purple-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Mobile page indicator */}
          <div className="md:hidden px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700">
            {displayedPage} / {totalPages}
          </div>

          {/* Next button */}
          <button
            onClick={() => handlePageChange(displayedPage + 1)}
            disabled={displayedPage >= totalPages || isLoading}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-r-md text-gray-300 bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <svg
              className="h-5 w-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>

        {/* Showing X of Y users */}
        <div className="text-sm text-gray-400">
          Showing {usersData.data.length} of{" "}
          <span className="font-medium">{total}</span> users
          {totalPages > 1 ? ` (Page ${displayedPage} of ${totalPages})` : ""}
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading && !isFetching) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Error state
  if (isError) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load users data";

    return (
      <div className="bg-red-900/20 border border-red-800 p-6 rounded-xl my-6">
        <h3 className="text-xl font-bold text-red-400 mb-2">
          Error Loading Users
        </h3>
        <p className="text-gray-300">{errorMessage}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-700/40 hover:bg-red-700/60 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        //{ opacity: 0, y: 20 }}
        // opacity: 1, y: 0 }}
        // duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          User Management
        </h1>
        <p className="text-gray-400 mt-2">
          View and manage all users registered on the platform
        </p>
      </div>

      {/* Filters and Search */}
      <div
        //{ opacity: 0, y: 20 }}
        // opacity: 1, y: 0 }}
        // duration: 0.5, delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 pr-12"
              />
              <div className="absolute inset-y-0 right-0 px-4 flex items-center">
                {isLoading && debouncedSearchTerm ? (
                  <svg
                    className="animate-spin h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                )}
              </div>
            </div>
          </form>

          {/* Role Filter */}
          <div className="w-full md:w-48">
            <select
              value={filterRole}
              onChange={handleRoleFilterChange}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {/* Rows per page */}
          <div className="w-full md:w-48">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div
        //{ opacity: 0, y: 20 }}
        // opacity: 1, y: 0 }}
        // duration: 0.5, delay: 0.2 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
      >
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Role
                </th>
                {/* <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th> */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {usersData?.data && usersData.data.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No users found matching your search criteria
                  </td>
                </tr>
              ) : (
                usersData?.data?.map((user) => (
                 <tr
                    key={user._id}
                    onClick={()=> router.push(`/dashboard/users/${user._id}`)}
                    className="hover:bg-gray-700/20 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          {user.profileImage ? (
                                             <div className="w-10 h-10 rounded-full overflow-hidden relative">
                                               <Image
                                                 src={user?.profileImage || "/default-profile.png"}
                                                 alt={user?.username}
                                                 width={40}
                                                 height={40}
                                                 className="w-full h-full object-cover"
                                                 style={{ borderRadius: "50%" }}
                                               />
                                             </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                              <span className="text-white font-bold">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-400">
                            ID: {user._id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "super_admin"
                            ? "bg-red-900/30 text-red-300 border border-red-800/40"
                            : user.role === "admin"
                            ? "bg-purple-900/30 text-purple-300 border border-purple-800/40"
                            : "bg-blue-900/30 text-blue-300 border border-blue-800/40"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === "inactive"
                            ? "bg-amber-900/30 text-amber-300 border border-amber-800/40"
                            : "bg-green-900/30 text-green-300 border border-green-800/40"
                        }`}
                      >
                        {user.status || "active"}
                      </span>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4">{renderPagination()}</div>
      </div>
    </div>
  );
};

export default Users;
