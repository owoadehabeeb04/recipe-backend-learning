"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/app/store/authStore';
import { deleteUser, getSingleUser } from '@/app/api/(users)';
import toast from 'react-hot-toast';

// Types
interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  bio?: string;
  location?: string;
  profileImage?: string;
  website?: string;
  phoneNumber?: string;
  socialMediaLink?: {
    name: string;
    link: string;
  };
  createdAt: string;
}

interface UserStats {
  totalCreated: number;
  publishedRecipes: number;
  unpublishedRecipes: number;
  savedRecipes: number;
}

interface Recipe {
  _id: string;
  title: string;
  featuredImage?: string;
  category: string;
  cookingTime: number;
  difficulty: string;
  isPublished: boolean;
  createdAt: string;
}

interface UserResponse {
  user: User;
  recipeStats: UserStats;
  recentRecipes: Recipe[];
}

const SingleUser = () => {
  const { slug } = useParams();
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const router = useRouter();
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        const response = await getSingleUser(token, slug as string);
        setUserData(response.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [slug, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-2">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-lg mb-4 text-center max-w-md">
          {error}
        </div>
        <Link href="/dashboard/users" className="text-primary hover:text-primary/80 transition-colors text-sm sm:text-base">
          ← Back to Users
        </Link>
      </div>
    );
  }

  const user = userData;
  const stats = userData?.recipeStats;
  const recentRecipes = userData?.recentRecipes || [];

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-lg mb-4 text-center max-w-md">
          User data not found
        </div>
        <Link href="/dashboard/users" className="text-primary hover:text-primary/80 transition-colors text-sm sm:text-base">
          ← Back to Users
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  // ... existing useEffect and other code

  const handleDeleteUser = async () => {
    if (!token || !slug) return;
    
    try {
      setIsDeleting(true);
      await deleteUser(token, slug as string);
      setIsDeleteModalOpen(false);
      toast.success('User deleted successfully');
      router.push('/dashboard/users');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete confirmation modal
  const DeleteModal = () => (
    <>
      {isDeleteModalOpen && (
        <div
          //{ opacity: 0 }}
          // opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            //{ scale: 0.9, opacity: 0 }}
            // scale: 1, opacity: 1 }}
            // type: "spring", damping: 20, stiffness: 300 }}
            className="bg-card border border-destructive/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-xl mx-2"
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-destructive/20">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            
            <div className="mt-3 sm:mt-4 text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Delete User Account</h3>
              <div className="mt-2">
                <p className="text-foreground text-sm sm:text-base">Are you sure you want to delete {userData?.username}'s account?</p>
                <p className="text-xs sm:text-sm text-destructive mt-2">This action cannot be undone and all associated data will be permanently removed.</p>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                className="flex-1 bg-muted hover:bg-muted/80 border border-border text-foreground rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition-colors"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center"
                onClick={handleDeleteUser}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
      </>
  );


  return (
    <div className="py-4 sm:py-6 px-2 sm:px-4 md:px-6">
      {/* Header with back button */}
      <div className="mb-6 sm:mb-8">
        <Link 
          href="/dashboard/users" 
          className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-3 sm:mb-4 transition-colors"
        >
          <svg 
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Users
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">User Profile</h1>
          
          <div className="flex space-x-2 sm:space-x-3">
            <button
              className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-destructive/20 hover:bg-destructive/30 border border-destructive/50 rounded-lg text-xs sm:text-sm text-destructive hover:text-destructive/90 transition-colors"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* Left sidebar with user profile */}
        <div
          //{ opacity: 0, y: 10 }}
          // opacity: 1, y: 0 }}
          // duration: 0.4 }}
          className="lg:col-span-1"
        >
          <div className="bg-card backdrop-blur-sm border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 sticky top-4 sm:top-8">
            <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3 sm:mb-4">
                {user.profileImage ? (
                  <Image 
                    src={user.profileImage} 
                    alt={user.username} 
                    fill
                    className="rounded-full object-cover border-2 border-primary"
                    sizes="(max-width: 640px) 80px, 96px"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-xl sm:text-2xl font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <span className={`absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-card ${user.role === 'admin' || user.role === 'super_admin' ? 'bg-primary' : 'bg-green-500'}`}></span>
              </div>
              
              <h2 className="text-lg sm:text-xl font-bold text-foreground">{user.username}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{user.email}</p>
              
              <div className="mt-2 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full bg-primary text-primary-foreground">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </div>
              
              {user.bio && (
                <p className="mt-3 sm:mt-4 text-muted-foreground text-xs sm:text-sm px-2">{user.bio}</p>
              )}
            </div>
            
            <div className="border-t border-border pt-3 sm:pt-4">
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                {user.location && (
                  <div className="flex items-center justify-center sm:justify-start">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-foreground truncate">{user.location}</span>
                  </div>
                )}
                
                {user.website && (
                  <div className="flex items-center justify-center sm:justify-start">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="text-primary hover:text-primary/80 transition-colors truncate">
                      {user.website.replace(/https?:\/\//i, '')}
                    </a>
                  </div>
                )}
                
                {user.phoneNumber && (
                  <div className="flex items-center justify-center sm:justify-start">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-foreground">{user.phoneNumber}</span>
                  </div>
                )}
                
                {user.socialMediaLink && (
                  <div className="flex items-center justify-center sm:justify-start">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <a 
                      href={user.socialMediaLink.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:text-primary/80 transition-colors truncate"
                    >
                      {user.socialMediaLink.name || user.socialMediaLink.link}
                    </a>
                  </div>
                )}
                
                <div className="flex items-center justify-center sm:justify-start">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-foreground">Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div
          //{ opacity: 0, y: 10 }}
          // opacity: 1, y: 0 }}
          // duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary text-[10px] sm:text-xs mb-0.5 sm:mb-1">Total Recipes</p>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    {stats?.totalCreated || "0"}
                  </h3>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary text-[10px] sm:text-xs mb-0.5 sm:mb-1">Published</p>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    {stats?.publishedRecipes || "0"}
                  </h3>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary text-[10px] sm:text-xs mb-0.5 sm:mb-1">Unpublished</p>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    {stats?.unpublishedRecipes || "0"}
                  </h3>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary text-[10px] sm:text-xs mb-0.5 sm:mb-1">Saved</p>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    {stats?.savedRecipes || "0"}
                  </h3>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-border overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 min-w-max sm:min-w-0">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('recipes')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'recipes'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                Recipes
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          <div>
            {/* Profile tab */}
            {activeTab === 'profile' && (
              <div
                //{ opacity: 0 }}
                // opacity: 1 }}
                // duration: 0.2 }}
              >
                <div className="bg-card backdrop-blur-sm border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-medium text-foreground mb-3 sm:mb-4">Profile Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <div className="mb-3 sm:mb-4">
                        <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">Username</label>
                        <div className="text-foreground text-sm sm:text-base">{user.username}</div>
                      </div>
                      
                      <div className="mb-3 sm:mb-4">
                        <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">Email</label>
                        <div className="text-foreground text-sm sm:text-base break-all">{user.email}</div>
                      </div>
                      
                      <div className="mb-3 sm:mb-4">
                        <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">Role</label>
                        <div className="text-foreground text-sm sm:text-base capitalize">{user.role}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-3 sm:mb-4">
                        <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">Location</label>
                        <div className="text-foreground text-sm sm:text-base">{user.location || 'Not specified'}</div>
                      </div>
                      
                      <div className="mb-3 sm:mb-4">
                        <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
                        <div className="text-foreground text-sm sm:text-base">{user.phoneNumber || 'Not specified'}</div>
                      </div>
                      
                      <div className="mb-3 sm:mb-4">
                        <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">Member Since</label>
                        <div className="text-foreground text-sm sm:text-base">{formatDate(user.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                  
                  {user.bio && (
                    <div className="mt-3 sm:mt-4">
                      <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">Bio</label>
                      <p className="text-foreground whitespace-pre-line text-sm sm:text-base">{user.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Recipes tab */}
            {activeTab === 'recipes' && (
              <div
                //{ opacity: 0 }}
                // opacity: 1 }}
                // duration: 0.2 }}
              >
                <div className="bg-card backdrop-blur-sm border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-medium text-foreground">Recent Recipes</h3>
                    {stats && stats.totalCreated > 0 && (
                      <Link 
                        href={`/dashboard/all-recipes`}
                        className="text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        View all recipes →
                      </Link>
                    )}
                  </div>
                  
                  {recentRecipes.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {recentRecipes.map((recipe: any) => (
                      <Link href={`/dashboard/recipe/${recipe._id}`} key={recipe._id}>  <div 
                          key={recipe._id} 
                          className="flex items-center bg-muted hover:bg-muted/80 rounded-xl overflow-hidden transition-colors cursor-pointer"
                        >
                          <div className="w-14 h-14 sm:w-16 sm:h-16 relative flex-shrink-0">
                            {recipe.featuredImage ? (
                              <Image 
                                src={recipe.featuredImage} 
                                alt={recipe.title} 
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 56px, 64px"
                              />
                            ) : (
                              <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-3 sm:p-4 flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                              <h4 className="font-medium text-foreground truncate text-sm sm:text-base">{recipe.title}</h4>
                              <span className={`px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full flex-shrink-0 ${
                                recipe.isPublished 
                                ? 'bg-primary/20 text-primary' 
                                : 'bg-muted-foreground/20 text-muted-foreground'
                              }`}>
                                {recipe.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </div>
                            
                            <div className="flex items-center mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground space-x-2 sm:space-x-3 flex-wrap">
                              <span>{recipe.category}</span>
                              <span>•</span>
                              <span>{recipe.cookingTime} min</span>
                              <span>•</span>
                              <span className="capitalize">{recipe.difficulty}</span>
                            </div>
                          </div>
                        </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted border border-border rounded-xl p-6 sm:p-8 text-center">
                      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-foreground mb-1 sm:mb-2 text-sm sm:text-base">No recipes found</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">This user hasn't created any recipes yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
      <DeleteModal />
 
    </div>
  );
};

export default SingleUser;