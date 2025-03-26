"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { motion } from "framer-motion";
import Image from "next/image";
// Icons
const HomeIcon = () => (
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
      strokeWidth="2"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    ></path>
  </svg>
);

const RecipeIcon = () => (
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
      strokeWidth="2"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    ></path>
  </svg>
);

const ProfileIcon = () => (
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
      strokeWidth="2"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    ></path>
  </svg>
);

const SecurityIcon = () => (
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
      strokeWidth="2"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    ></path>
  </svg>
);

const BellIcon = () => (
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
      strokeWidth="2"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    ></path>
  </svg>
);

export default function DashboardLayout({ children }: any) {
  const { user } = useAuthStore();
  console.log(user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <HomeIcon /> },
    {
      name: "Create Recipe",
      href: "/dashboard/create-recipe",
      icon: <RecipeIcon />
    },
    { name: "My Recipes", href: "/dashboard/my-recipes", icon: <RecipeIcon /> },
    {
      name: "All Recipes",
      href: "/dashboard/all-recipes",
      icon: <RecipeIcon />
    },
    { name: "Profile", href: `/dashboard/profile`, icon: <ProfileIcon /> },
    { name: "Security", href: "/dashboard/security", icon: <SecurityIcon /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full backdrop-blur-lg bg-black/20 border-b border-white/10">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="inline-flex items-center p-2 text-sm rounded-lg md:hidden focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </button>

              {/* Logo */}
              <Link href="/dashboard" className="flex ml-2 md:mr-24">
                <span className="self-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 whitespace-nowrap">
                  RecipeApp
                </span>
              </Link>
            </div>

            <div className="flex items-center">
              {/* Notification bell */}
              <div className="mr-4 relative">
                <button className="p-1 rounded-full hover:bg-gray-700/50 transition-colors">
                  <BellIcon />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full"></span>
                </button>
              </div>

              {/* User menu */}
              {/* <div className="relative">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden md:flex ml-2">
                    {user?.username || "User"}
                  </span>
                </div>
              </div> */}
              <div className="relative">
                <div className="flex items-center">
                  {user?.username ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden relative">
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
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="hidden md:flex ml-2">
                    {user?.username || "User"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 border-r border-white/10 bg-black/30 backdrop-blur-xl transition-transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="h-full px-3 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;

              return (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={`group flex items-center p-3 rounded-lg ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600/50 to-pink-600/50 text-white"
                        : "text-gray-400 hover:bg-gray-700/30"
                    } transition-all duration-300`}
                  >
                    <div
                      className={`${
                        isActive
                          ? "text-white"
                          : "text-purple-400 group-hover:text-white"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span className="ml-3">{item.name}</span>

                    {isActive && (
                      <motion.div
                        layoutId="sidebar-highlight"
                        className="ml-auto w-1.5 h-5 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"
                      />
                    )}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Content area */}
      <div className="p-4 md:ml-64 pt-20">
        <div className="p-4 rounded-lg">{children}</div>
      </div>
    </div>
  );
}
