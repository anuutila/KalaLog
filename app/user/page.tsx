'use client';

import { useGlobalState } from "@/context/GlobalState";
import { useLoadingOverlay } from "@/context/LoadingOverlayContext";
import { showNotification } from "@/lib/notifications/notifications";
import { ErrorResponse, LogoutResponse } from "@/lib/types/responses";
import { handleApiError } from "@/lib/utils/handleApiError";
import { logout } from "@/services/api/authservice";
import { LoadingOverlay } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { isLoggedIn, jwtUserInfo, setIsLoggedIn, setJwtUserInfo } = useGlobalState();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login'); // Redirect to login if not logged in
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    // Optionally show a loading state while redirecting
    return <LoadingOverlay visible={true} overlayProps={{ blur: 2, zIndex: 2000, bg: 'rgba(0,0,0,0.5', fixed: true}}/>;
  }

  const handleLogout = async () => {
    try {
      const logoutResponse: LogoutResponse = await logout();
      console.log(logoutResponse.message);
      showNotification('success', `${logoutResponse.message} See you later ${jwtUserInfo?.firstname}! 👋`, { withTitle: false })
      
      // Update global state
      setIsLoggedIn(false);
      setJwtUserInfo(null);

      // Redirect to the login page
      router.push('/login');
    } catch (error) {
      handleApiError(error, 'logout');
    }
  };

  return (
    <>
      User page!
      { isLoggedIn && <div><button onClick={handleLogout}>Log Out</button></div> }
    </>
  );
}