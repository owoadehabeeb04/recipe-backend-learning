"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/app/api/(auth)/login";
import { useAuthStore } from "@/app/store/authStore";
import toast from "react-hot-toast";
import { setAuthCookie } from "@/utils/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  useEffect(() => {
    console.log(isLoginSuccess, successData);
    if (isLoginSuccess && successData) {
      setAuthCookie(successData.access_token);
      
      // Check for returnUrl in search params
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get('returnUrl');
      console.log({returnUrl})
      
      // If returnUrl exists, redirect there, otherwise go to dashboard
      router.push(returnUrl || "/dashboard");
      window.location.href = returnUrl || "/dashboard";
      setAuth(successData.access_token, successData.user);
      toast.success("Login successful");
setIsLoginSuccess(false)
    }
  }, [isLoginSuccess, successData, router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response: any = await login(data);

      if (response.access_token) {
        setAuth(response.access_token, response.user);
        setSuccessData(response);
        setIsLoginSuccess(true);
      } else {
        toast.error("Login failed");
      }
    } catch (error: AxiosError | any) {
      console.error("Login failed:", error);
      if (error.status === 401) {
        toast.error("Invalid email or password");
      } else {
        toast.error("Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-foreground">Welcome Back</h2>
        <p className="text-muted-foreground">
          Sign in to access your recipes
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              {...register("email")}
              type="email"
              id="email"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              {...register("password")}
              type="password"
              id="password"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/reset-password"
              className="text-sm font-medium text-primary hover:opacity-80 transition-opacity"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity py-3 rounded-lg font-medium"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5"
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
              Signing in...
            </div>
          ) : (
            "Sign in"
          )}
        </button>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:opacity-80 transition-opacity"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
