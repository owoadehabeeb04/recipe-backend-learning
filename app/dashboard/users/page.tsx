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
  const router = useRouter();
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
        <div className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6 text-center">
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
      <div className="mt-4 sm:mt-6 flex flex-col items-center space-y-2 sm:space-y-3">
        <div className="flex items-center justify-center w-full">
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(displayedPage - 1)}
            disabled={displayedPage <= 1 || isLoading}
            className="relative inline-flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-l-md text-foreground bg-card border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2"
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
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page numbers */}
          <div className="hidden md:flex">
            {pageNumbers.map((page, index) => {
              if (page === "ellipsis1" || page === "ellipsis2") {
                return (
                  <span
                    key={`${page}-${index}`}
                    className="relative inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-foreground bg-card border border-border"
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
                  className={`relative inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border transition-colors ${
                    page === displayedPage
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border text-foreground hover:bg-muted"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Mobile page indicator */}
          <div className="md:hidden px-3 sm:px-4 py-2 text-xs sm:text-sm text-foreground bg-card border-x border-border">
            {displayedPage} / {totalPages}
          </div>

          {/* Next button */}
          <button
            onClick={() => handlePageChange(displayedPage + 1)}
            disabled={displayedPage >= totalPages || isLoading}
            className="relative inline-flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-r-md text-foreground bg-card border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 sm:ml-2"
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
        <div className="text-xs sm:text-sm text-muted-foreground text-center px-2">
          Showing {usersData.data.length} of{" "}
          <span className="font-medium text-foreground">{total}</span> users
          {totalPages > 1 ? ` (Page ${displayedPage} of ${totalPages})` : ""}
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading && !isFetching) {
    return (
      <div className="flex justify-center items-center h-[60vh] px-2">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (isError) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load users data";

    return (
      <div className="bg-destructive/10 border border-destructive/30 p-4 sm:p-6 rounded-xl my-4 sm:my-6 mx-2 sm:mx-0">
        <h3 className="text-lg sm:text-xl font-bold text-destructive mb-2">
          Error Loading Users
        </h3>
        <p className="text-foreground text-sm sm:text-base">{errorMessage}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg text-sm sm:text-base transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-0">
      <div
        //{ opacity: 0, y: 20 }}
        // opacity: 1, y: 0 }}
        // duration: 0.5 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
          User Management
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          View and manage all users registered on the platform
        </p>
      </div>

      {/* Filters and Search */}
      <div
        //{ opacity: 0, y: 20 }}
        // opacity: 1, y: 0 }}
        // duration: 0.5, delay: 0.1 }}
        className="bg-card backdrop-blur-sm border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6"
      >
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10 sm:pr-12 text-sm sm:text-base"
              />
              <div className="absolute inset-y-0 right-0 px-3 sm:px-4 flex items-center">
                {isLoading && debouncedSearchTerm ? (
                  <svg
                    className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"
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
                    className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"
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

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Role Filter */}
            <div className="w-full sm:w-48">
              <select
                value={filterRole}
                onChange={handleRoleFilterChange}
                disabled={isLoading}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 text-sm sm:text-base"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            {/* Rows per page */}
            <div className="w-full sm:w-48">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                disabled={isLoading}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 text-sm sm:text-base"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div
        //{ opacity: 0, y: 20 }}
        // opacity: 1, y: 0 }}
        // duration: 0.5, delay: 0.2 }}
        className="bg-card backdrop-blur-sm border border-border rounded-xl sm:rounded-2xl overflow-hidden relative"
      >
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Mobile Card View */}
        <div className="block md:hidden">
          {usersData?.data && usersData.data.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground">
              No users found matching your search criteria
            </div>
          ) : (
            <div className="divide-y divide-border">
              {usersData?.data?.map((user) => (
                <div
                  key={user._id}
                  onClick={() => router.push(`/dashboard/users/${user._id}`)}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
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
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {user.username}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-1 inline-flex text-[10px] sm:text-xs leading-4 font-semibold rounded-full ${
                        user.role === "super_admin"
                          ? "bg-destructive/20 text-destructive border border-destructive/30"
                          : user.role === "admin"
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-primary/20 text-primary border border-primary/30"
                      }`}
                    >
                      {user.role}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th
                  scope="col"
                  className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usersData?.data && usersData.data.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No users found matching your search criteria
                  </td>
                </tr>
              ) : (
                usersData?.data?.map((user) => (
                  <tr
                    key={user._id}
                    onClick={() => router.push(`/dashboard/users/${user._id}`)}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          {user.profileImage ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden relative">
                              <Image
                                src={
                                  user?.profileImage || "/default-profile.png"
                                }
                                alt={user?.username}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                style={{ borderRadius: "50%" }}
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                              <span className="text-primary-foreground font-bold text-sm">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">
                            {user.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {user._id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "super_admin"
                            ? "bg-destructive/20 text-destructive border border-destructive/30"
                            : user.role === "admin"
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "bg-primary/20 text-primary border border-primary/30"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default Users;
