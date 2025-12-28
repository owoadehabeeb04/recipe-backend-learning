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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

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
    <div className="w-full space-y-6">
      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="flex justify-center">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`rounded-full transition-colors flex items-center justify-center w-8 h-8 text-sm ${
                  steps >= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {steps > step ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step
                )}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-1 mx-1 ${
                    steps > step ? "bg-primary" : "bg-muted"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            {stepInfo[steps - 1].title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {stepInfo[steps - 1].description}
          </p>
        </div>
      </div>

      {/* Step 1: Email Form */}
      {steps === 1 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              {...register("email")}
              type="email"
              id="email"
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
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
                Sending...
              </div>
            ) : (
              "Send Verification Code"
            )}
          </button>
        </form>
      )}

      {/* Step 2: OTP Form */}
      {steps === 2 && (
        <form onSubmit={handleSubmitOtp(verifyOtp)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              {...registerOtp("otp")}
              type="text"
              id="otp"
              maxLength={6}
              className="text-center tracking-widest text-lg"
              placeholder="● ● ● ● ● ●"
            />
            {otpErrors.otp && (
              <p className="text-center text-sm text-destructive">
                {otpErrors.otp.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setSteps(1)}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
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
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
              Back
            </button>

            <button
              type="button"
              className="text-primary hover:opacity-80 transition-opacity font-medium"
              onClick={() => onSubmit({ email })}
            >
              Resend Code
            </button>
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
                Verifying...
              </div>
            ) : (
              "Verify Code"
            )}
          </button>
        </form>
      )}

      {/* Step 3: New Password Form */}
      {steps === 3 && (
        <form onSubmit={handleSubmitPassword(changePassword)} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                {...registerPassword("password")}
                type="password"
                id="password"
                placeholder="Enter new password"
              />
              {passwordErrors.password && (
                <p className="text-sm text-destructive">
                  {passwordErrors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                {...registerPassword("confirmPassword")}
                type="password"
                id="confirmPassword"
                placeholder="Confirm new password"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSteps(2)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
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
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
              Back
            </button>
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
                Resetting...
              </div>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      )}

      {/* Back to login link */}
      <div className="text-center pt-4">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
