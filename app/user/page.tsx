'use client';

import { useGlobalState } from "@/context/GlobalState";
import { showNotification } from "@/lib/notifications/notifications";
import { ErrorResponse, LogoutResponse } from "@/lib/types/responses";
import { LoadingOverlay } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { isLoggedIn, jwtUserInfo, setIsLoggedIn, setJwtUserInfo } = useGlobalState();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login'); // Redirect to login if not logged in
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    // Optionally show a loading state while redirecting
    return <LoadingOverlay visible />;
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });

      if (response.ok) {
        const logoutResponse: LogoutResponse = await response.json();
        console.log(logoutResponse.message);
        showNotification('success', `${logoutResponse.message} See you later ${jwtUserInfo?.firstname}! 👋`, { withTitle: false });

        // Update global state
        setIsLoggedIn(false);
        setJwtUserInfo(null);

        // Redirect to the login page
        router.push('/login');
      } else {
        const errorResponse: ErrorResponse = await response.json();
        console.error('Failed to log out:', errorResponse.message, errorResponse.details);
        showNotification('error', 'An unexpected error occurred while logging out. Please try again.', { withTitle: true });
      }
    } catch (error) {
      console.error('Unexpected error logging out:', error);
      showNotification('error', 'An unexpected error occurred while logging out. Please try again.', { withTitle: true });
    }
  };

  return (
    <>
      User page!
      { isLoggedIn && <div><button onClick={handleLogout}>Log Out</button></div> }
    </>
  );
}