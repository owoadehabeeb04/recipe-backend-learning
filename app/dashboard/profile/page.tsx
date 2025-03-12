"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../store/authStore";

const ProfilePage = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
      location: user?.location || "",
      website: user?.website || ""
    }
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    // API call to update profile would go here
    console.log("Profile update data:", data);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false);
      // Update user in auth store would happen here
    }, 1000);
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Profile Settings
        </h1>
        <p className="text-gray-400 mt-2">
          Manage your personal information and preferences
        </p>
      </motion.div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-semibold text-white">
                {user?.username || "Username"}
              </h2>
              <p className="text-gray-400">
                {user?.email || "email@example.com"}
              </p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Username</label>
              <input
                {...register("username", { required: "Username is required" })}
                type="text"
                disabled={!isEditing}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white disabled:opacity-60"
              />
              {errors.username && (
                <p className="text-pink-500 text-sm">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Email Address</label>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                disabled={true} // Email is always disabled as it's a key identifier
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white disabled:opacity-60"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-gray-300 text-sm">Bio</label>
              <textarea
                {...register("bio")}
                disabled={!isEditing}
                rows={4}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white disabled:opacity-60"
              />
            </div>
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Location</label>
              <input
                {...register("location")}
                type="text"
                disabled={!isEditing}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white disabled:opacity-60"
              />
            </div>
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Website</label>
              <input
                {...register("website")}
                type="url"
                disabled={!isEditing}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white disabled:opacity-60"
              />
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-600 rounded-full text-gray-300 hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-70"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
