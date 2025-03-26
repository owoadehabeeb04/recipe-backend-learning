"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../store/authStore";
import { updateProfile } from "../../api/(users)";
import Image from "next/image";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "@/app/api/(recipe)/uploadImage";

interface SocialMediaLink {
  name: string;
  link: string;
}

const ProfilePage = () => {
  const { user, token, setAuth } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    user?.profileImage || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Social media state
  const [socialMediaName, setSocialMediaName] = useState<string>(
    user?.socialMediaLink?.name || ""
  );
  const [socialMediaUrl, setSocialMediaUrl] = useState<string>(
    user?.socialMediaLink?.link || ""
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm({
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      bio: user?.bio || "",
      location: user?.location || "",
      website: user?.website || "",
      profileImage: user?.profileImage || ""
    }
  });
  console.log({user})

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      reset({
        username: user.username || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        profileImage: user.profileImage || ""
      });
      
      // Update social media state
      if (user.socialMediaLink) {
        setSocialMediaName(user.socialMediaLink.name || "");
        setSocialMediaUrl(user.socialMediaLink.link || "");
      }
      
      setPreviewImage(user.profileImage || null);
    }
  }, [user, reset]);
console.log({errors})
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Show preview immediately for better UX
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Show uploading state
        setUploadingImage(true);
        toast.loading("Uploading image...", { id: "imageUpload" });

        // Upload to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(file);
        
        // Update form value with Cloudinary URL
        setValue("profileImage", cloudinaryUrl);
        setPreviewImage(cloudinaryUrl);
        
        // Show success message
        toast.success("Image uploaded successfully", { id: "imageUpload" });
      } catch (error) {
        console.error('Image upload failed:', error);
        toast.error("Failed to upload image", { id: "imageUpload" });
        // Keep the preview but don't set the form value
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  console.log(isLoading, uploadingImage)

  const onSubmit = async (data: any) => {
    if (!token) {
      toast.error("You must be logged in to update your profile");
      return;
    }
    console.log('form data', data)
    setIsLoading(true);
    try {
      // Only include fields that are defined
      const payload = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== "") {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      // Add social media link as an object if both name and link are provided
      if (socialMediaName && socialMediaUrl) {
        payload.socialMediaLink = {
          name: socialMediaName,
          link: socialMediaUrl
        };
      }

      const result = await updateProfile(payload, token, user?._id);
      console.log("Profile update result:", result);
      
      if (result.success) {
        toast.success("Profile updated successfully");
        // Update user in auth store
        if (setAuth) {
          setAuth(token, result.data.data);
        }
        setIsEditing(false);
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsEditing(false);
    // Reset form to original user values
    reset({
      username: user?.username || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      bio: user?.bio || "",
      location: user?.location || "",
      website: user?.website || ""
    });
    
    // Reset social media fields
    setSocialMediaName(user?.socialMediaLink?.name || "");
    setSocialMediaUrl(user?.socialMediaLink?.link || "");
    
    setPreviewImage(user?.profileImage || null);
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
            <div 
              onClick={isEditing && !uploadingImage ? triggerFileInput : undefined}
              className={`w-20 h-20 rounded-full overflow-hidden relative ${isEditing && !uploadingImage ? 'cursor-pointer hover:opacity-80' : ''}`}
            >
              {/* Overlay loading indicator for image upload */}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span className="text-white text-xs">Uploading...</span>
                  </div>
                </div>
              )}
              
              {previewImage ? (
                <Image 
                  src={previewImage} 
                  alt="Profile" 
                  width={80} 
                  height={80} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
                disabled={!isEditing || uploadingImage}
              />
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-semibold text-white">
                {user?.username || "Username"}
              </h2>
              <p className="text-gray-400">
                {user?.email || "email@example.com"}
              </p>
              {isEditing && (
                <p className="text-purple-400 text-sm mt-1">
                  {uploadingImage ? "Uploading image..." : "Click on the avatar to change your profile image"}
                </p>
              )}
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
            
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Phone Number</label>
              <input
                {...register("phoneNumber", {
                  pattern: {
                    value:
                      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                    message: "Please enter a valid phone number"
                  }
                })}
                type="tel"
                disabled={!isEditing}
                placeholder="e.g., +1 (555) 123-4567"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white disabled:opacity-60"
              />
              {errors.phoneNumber && (
                <p className="text-pink-500 text-sm">
                  {errors.phoneNumber.message &&
                    typeof errors.phoneNumber.message === "string" &&
                    errors.phoneNumber.message}
                </p>
              )}
            </div>
            
            {/* Social Media section with two fields */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-gray-300 text-sm">Social Media</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    value={socialMediaName}
                    onChange={(e) => setSocialMediaName(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Platform (e.g., Facebook, Twitter)"
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white disabled:opacity-60"
                  />
                </div>
                <div>
                  <input
                    type="url"
                    value={socialMediaUrl}
                    onChange={(e) => setSocialMediaUrl(e.target.value)}
                    disabled={!isEditing}
                    placeholder="URL (e.g., https://twitter.com/username)"
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white disabled:opacity-60"
                    pattern="https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)"
                  />
                </div>
              </div>
              {/* Display current social media if available */}
              {!isEditing && user?.socialMediaLink && (
                <p className="text-gray-400 text-sm mt-2">
                  {user.socialMediaLink.name}: <a href={user.socialMediaLink.link} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">{user.socialMediaLink.link}</a>
                </p>
              )}
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-gray-300 text-sm">Bio</label>
              <textarea
                {...register("bio")}
                disabled={!isEditing}
                rows={4}
                placeholder="Tell us a little about yourself..."
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white disabled:opacity-60"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Location</label>
              <input
                {...register("location")}
                type="text"
                disabled={!isEditing}
                placeholder="e.g., New York, NY"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white disabled:opacity-60"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Website</label>
              <input
                {...register("website", {
                  pattern: {
                    value: /^(ftp|http|https):\/\/[^ "]+$/,
                    message: "Please enter a valid URL"
                  }
                })}
                type="text"
                disabled={!isEditing}
                placeholder="e.g., https://yourwebsite.com"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white disabled:opacity-60"
              />
              {errors.website && (
                <p className="text-pink-500 text-sm">
                  {errors.website.message &&
                    typeof errors.website.message === "string" &&
                    errors.website.message}
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-gray-600 rounded-full text-gray-300 hover:bg-gray-700 transition-all"
                disabled={uploadingImage}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || uploadingImage}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-70 flex items-center"
              >
                {(isLoading || uploadingImage) && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                )}
                {isLoading ? "Saving..." : uploadingImage ? "Uploading Image..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;