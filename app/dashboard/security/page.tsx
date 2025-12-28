"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../store/authStore";
import { changePassword } from "../../api/(security)/change-password";
import toast from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const SecurityPage = () => {
  const { token, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
    if (!token) {
      toast.error("You must be logged in to change your password");
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const payload = {
        email: user?.email,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };

      const result = await changePassword(payload, token);

      if (result.success) {
        setSuccessMessage("Your password has been successfully changed.");
        toast.success("Password updated successfully");
        reset();
      } else {
        // Set error message
        const errorMsg = result.message || "Failed to update password";
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMsg = "An unexpected error occurred";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Security Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your password and security preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-600 dark:text-green-400">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  {...register("currentPassword", {
                    required: "Current password is required"
                  })}
                  type="password"
                  placeholder="Enter your current password"
                />
                {errors.currentPassword && (
                  <p className="text-sm text-destructive">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
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
                  placeholder="Enter your new password"
                />
                {errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === watch("newPassword") || "Passwords do not match"
                  })}
                  type="password"
                  placeholder="Confirm your new password"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading && (
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></span>
                  )}
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityPage;