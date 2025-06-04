"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore, User } from "../store/authStore";
import { motion } from "framer-motion";
import Image from "next/image";
import Users from "./users/page";
import toast from "react-hot-toast";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { setAuth } = useAuthStore();
  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <HomeIcon />,
      roles: ["user", "admin", "super_admin"],
    },
    {
      name: "Create Recipe",
      href: "/dashboard/create-recipe",
      icon: <RecipeIcon />,
      roles: ["admin"],
    },
    {
      name: "My Recipes",
      href: "/dashboard/my-recipes",
      icon: <RecipeIcon />,
      roles: ["admin"],
    },
    {
      name: "All Recipes",
      href: "/dashboard/all-recipes",
      icon: <RecipeIcon />,
      roles: ["super_admin", "user"],
    },
    {
      name: "Favorite Recipes",
      href: "/dashboard/favorites",
      icon: (
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
            d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
          />
        </svg>
      ),
      roles: ["user"],
    },
    {
      name: "Meal Planner",
      href: "/dashboard/meal-planner",
      icon: (
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      roles: ["user"],
    },
    {
      name: "Aria",
      href: "/dashboard/aria",
      icon: (
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
          d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"
        />
      </svg>
      ),
      roles: ["user"],
    },
    {
      name: "Users",
      href: "/dashboard/users",
      icon: <ProfileIcon />,
      roles: ["super_admin"],
    },
    {
      name: "Profile",
      href: `/dashboard/profile`,
      icon: <ProfileIcon />,
      roles: ["user", "admin", "super_admin"],
    },
    {
      name: "Security",
      href: "/dashboard/security",
      icon: <SecurityIcon />,
      roles: ["user", "admin", "super_admin"],
    },
  ];

  const finalMenuItems = menuItems.filter((item: any) =>
    item.roles.includes(user?.role)
  );

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
              <Link href="/dashboard" className="flex items-center ml-2 md:mr-24">
                <span className="self-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 whitespace-nowrap">
                  Recipia
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
              <div className="relative">
                <div className="flex items-center">
                  {user?.profileImage && user?.profileImage ? (
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
    pathname.startsWith('/dashboard/aria') 
      ? '-translate-x-full' 
      : isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
  }`}
>
        <div className="h-full px-3 overflow-y-auto">
          <div className="flex flex-col h-full justify-between">
            {/* Main menu items */}
            <div className="flex-1">
              <ul className="space-y-1">
                {finalMenuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
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

            {/* Logout at the bottom */}
            <div className="mt-auto mb-[5rem] pt-4 border-t border-gray-700/30">
              <motion.div
                key="logout"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <button
                  onClick={async () => {
                    try {
                      setAuth("", {} as User);

                      window.location.href = "/login";
                      toast.success("Logout successful");
                    } catch (error) {
                      console.error("Logout failed:", error);
                    }
                  }}
                  className="w-full cursor-pointer group flex items-center p-3 rounded-lg text-gray-400 hover:bg-gray-700/30 transition-all duration-300"
                >
                  <div className="text-purple-400 group-hover:text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.7Z5 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9a.75.75 0 01-1.5 0V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="ml-3">Logout</span>
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </aside>

      {/* Content area */}
      <div className={` ${pathname.startsWith('/dashboard/aria') ? 'pt-16 p-2 sm:p-4  sm:pt-20' : 'md:ml-64 p-4 pt-20'} `}>  <div className="p-4 rounded-lg">{children}</div>
</div>
    </div>
  );
}
