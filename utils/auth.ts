export const setAuthCookie = (token: string) => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Calculate expiry (7 days)
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    
    // Set cookie
    document.cookie = `auth-token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax${
      process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? '; Secure' : ''
    }`;
    
  };
  
  export const clearAuthCookie = () => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Clear by setting expired date
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
  };