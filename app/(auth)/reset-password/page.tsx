"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/app/api/(auth)/verify-email";
import { verifyEmail, verifyOTP } from "@/app/api/(auth)/verify-email";
import Link from "next/link";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email")
});

type EmailFormData = z.infer<typeof emailSchema>;

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits")
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase and number"
      ),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

type OtpFormData = z.infer<typeof otpSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ResetPasswordPage() {
  const [steps, setSteps] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  // Email form
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema)
  });

  // OTP form
  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors }
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema)
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors }
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  const onSubmit = async (data: EmailFormData) => {
    try {
      setIsLoading(true);
      await verifyEmail(data);
      setEmail(data.email);
      toast.success("Verification email sent!");
      setSteps(2);
    } catch (error) {
      toast.error("Failed to send verification email");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (data: OtpFormData) => {
    try {
      setIsLoading(true);
      await verifyOTP({ ...data, email });
      toast.success("OTP verified successfully!");
      setSteps(3);
    } catch (error) {
      toast.error("Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: PasswordFormData) => {
    try {
      setIsLoading(true);
      await resetPassword({ ...data, email });
      toast.success("Password reset successfully!");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  // Step titles and descriptions
  const stepInfo = [
    {
      title: "Verify Your Email",
      description: "Enter your email to receive a verification code"
    },
    {
      title: "Enter Verification Code",
      description: "Enter the 6-digit code sent to your email"
    },
    {
      title: "Create New Password",
      description: "Set a new secure password for your account"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500 rounded-full filter blur-3xl opacity-10 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500 rounded-full filter blur-3xl opacity-10 -ml-20 -mb-20"></div>
      </div>

      <div
        
        className="max-w-md w-full space-y-8 p-8 bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl shadow-xl"
      >
        <div>
          {/* Progress indicator */}
          <div className="flex justify-center mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`rounded-full transition-colors flex items-center justify-center w-8 h-8 text-sm ${
                    steps >= step
                      ? "bg-gradient-to-r from-cyan-500 to-indigo-500 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {steps > step ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 ${
                      steps > step
                        ? "bg-gradient-to-r from-cyan-500 to-indigo-500"
                        : "bg-gray-700"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          <h2
            key={`step-title-${steps}`}
            
            className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400"
          >
            {stepInfo[steps - 1].title}
          </h2>

          <p
            key={`step-desc-${steps}`}
         
            className="mt-2 text-center text-sm text-gray-400"
          >
            {stepInfo[steps - 1].description}
          </p>
        </div>

        {/* Step 1: Email Form */}
        {steps === 1 && (
          <form
           
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-6"
          >
            <div className="space-y-3">
              <div className="relative">
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
                  className="appearance-none bg-gray-900/50 text-white pl-10 rounded-lg block w-full px-4 py-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p
                  
                  className="text-sm text-pink-500"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-cyan-500/20"
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
                  Sending...
                </div>
              ) : (
                <div className="flex items-center">
                  Send Verification Code
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
          </form>
        )}

        {/* Step 2: OTP Form */}
        {steps === 2 && (
          <form
            //{ opacity: 0, y: 10 }}
            // opacity: 1, y: 0 }}
            // duration: 0.4 }}
            onSubmit={handleSubmitOtp(verifyOtp)}
            className="mt-8 space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <div className="relative">
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
                    {...registerOtp("otp")}
                    type="text"
                    maxLength={6}
                    className="appearance-none bg-gray-900/50 text-white pl-10 text-center tracking-widest rounded-lg block w-full px-4 py-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                    placeholder="● ● ● ● ● ●"
                  />
                </div>
              </div>
              {otpErrors.otp && (
                <p
                  //{ opacity: 0 }}
                  // opacity: 1 }}
                  className="text-center text-sm text-pink-500"
                >
                  {otpErrors.otp.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSteps(1)}
                className="flex items-center text-sm font-medium text-gray-400 hover:text-gray-300 transition-colors"
              >
                <svg
                  className="mr-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
                Back
              </button>

              <button
                type="button"
                className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                onClick={() => onSubmit({ email })}
              >
                Resend Code
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
               // scale: 1.02 }}
              // whileTap={{ scale: 0.98 }}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-cyan-500/20"
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
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center">
                  Verify Code
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
          </form>
        )}

        {/* Step 3: New Password Form */}
        {steps === 3 && (
          <form
            //{ opacity: 0, y: 10 }}
            // opacity: 1, y: 0 }}
            // duration: 0.4 }}
            onSubmit={handleSubmitPassword(changePassword)}
            className="mt-8 space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
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
                    {...registerPassword("password")}
                    type="password"
                    className="appearance-none bg-gray-900/50 text-white pl-10 rounded-lg block w-full px-4 py-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>
                {passwordErrors.password && (
                  <p
                    //{ opacity: 0 }}
                    // opacity: 1 }}
                    className="text-sm text-pink-500"
                  >
                    {passwordErrors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="relative">
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
                        d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <input
                    {...registerPassword("confirmPassword")}
                    type="password"
                    className="appearance-none bg-gray-900/50 text-white pl-10 rounded-lg block w-full px-4 py-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
                {passwordErrors.confirmPassword && (
                  <p
                    //{ opacity: 0 }}
                    // opacity: 1 }}
                    className="text-sm text-pink-500"
                  >
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSteps(2)}
                className="flex items-center text-sm font-medium text-gray-400 hover:text-gray-300 transition-colors"
              >
                <svg
                  className="mr-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
                Back
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
               // scale: 1.02 }}
              // whileTap={{ scale: 0.98 }}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-cyan-500/20"
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
                  Resetting...
                </div>
              ) : (
                <div className="flex items-center">
                  Reset Password
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
          </form>
        )}

        {/* Back to login link */}
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-400 hover:text-gray-300 transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
