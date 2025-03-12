"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";

const SecurityPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setSuccessMessage("");

    // API call to change password would go here
    console.log("Password change data:", data);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage("Your password has been successfully changed.");
      reset();
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
          Security Settings
        </h1>
        <p className="text-gray-400 mt-2">
          Manage your password and security preferences
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
      >
        <h2 className="text-xl font-semibold text-white mb-6">
          Change Password
        </h2>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Current Password</label>
              <input
                {...register("currentPassword", {
                  required: "Current password is required"
                })}
                type="password"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white"
              />
              {errors.currentPassword && (
                <p className="text-pink-500 text-sm">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-gray-300 text-sm">New Password</label>
              <input
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long"
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message:
                      "Password must contain uppercase, lowercase, and numbers"
                  }
                })}
                type="password"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white"
              />
              {errors.newPassword && (
                <p className="text-pink-500 text-sm">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-gray-300 text-sm">
                Confirm New Password
              </label>
              <input
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watch("newPassword") || "Passwords do not match"
                })}
                type="password"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white"
              />
              {errors.confirmPassword && (
                <p className="text-pink-500 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-70"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SecurityPage;
