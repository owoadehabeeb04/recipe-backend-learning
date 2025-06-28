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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      {/* Background elements */}
      
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-10 -ml-20 -mt-20"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-10 -mr-20 -mb-20"></div>
      </div>

      <div
        
        className="max-w-md w-full space-y-8 p-8 bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl shadow-xl"
      >
        <div>
          <h2
         
            className="mt-2 text-center text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
          >
            Welcome Back
          </h2>
          <p
      
            className="mt-2 text-center text-sm text-gray-400"
          >
            Sign in to access your recipes
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div
            
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  {...register("email")}
                  type="email"
                  className="appearance-none bg-gray-900/50 text-white pl-10 rounded-lg block w-full px-4 py-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-pink-500">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  {...register("password")}
                  type="password"
                  className="appearance-none bg-gray-900/50 text-white pl-10 rounded-lg block w-full px-4 py-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-pink-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/reset-password"
                className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div
          
          >
            <button
              type="submit"
              disabled={isLoading}
        
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-blue-500/20"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                <div className="flex items-center">
                  Sign in
                  <svg
                    className="ml-2 -mr-1 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    ></path>
                  </svg>
                </div>
              )}
            </button>
          </div>

          <div
            className="text-center mt-4"
          >
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
