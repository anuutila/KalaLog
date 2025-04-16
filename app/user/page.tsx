'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingOverlay } from '@mantine/core';
import { useGlobalState } from '@/context/GlobalState';
import classes from '../../context/LoadingOverlayContext.module.css';

export default function UserRedirectPage() {
  const router = useRouter();
  const { isLoggedIn, jwtUserInfo } = useGlobalState();

  useEffect(() => {
    if (isLoggedIn === null) {
      return;
    }

    if (isLoggedIn && jwtUserInfo?.username) {
      // If logged in, redirect to their dynamic profile page
      console.log(`User is logged in, redirecting to /user/${jwtUserInfo.username}`);
      router.replace(`/user/${jwtUserInfo.username}`);
    } else {
      // If not logged in, redirect to the login page
      console.log('User is not logged in, redirecting to /login');
      router.replace('/login');
    }
  }, [isLoggedIn, jwtUserInfo, router]);

  return (
    <LoadingOverlay
      visible
      classNames={{ root: classes.loading_overlay_root, loader: classes.loading_overlay_loader }}
      overlayProps={{ blur: 2, zIndex: 2000, bg: 'rgba(0,0,0,0.5)', w: '100dvw', h: '100dvh', fixed: true }}
      w={'100dvw'}
      h={'100dvh'}
    />
  );
}