'use client'

import { showNotification } from '@/lib/notifications/notifications'
import { handleApiError } from '@/lib/utils/handleApiError'
import { sendTestNotification, subscribe, unsubscribe } from '@/services/api/pushSubscriptionService'
import { Alert, Box, Button, rem, Stack, Text } from '@mantine/core'
import { IconAlertCircle, IconBellOff, IconBellRingingFilled, IconCircleCheck, IconCircleX, IconSend } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushNotificationManager() {
  const t = useTranslations();
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  )

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    })
    const sub = await registration.pushManager.getSubscription()
    setSubscription(sub)
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      setSubscription(sub);

      const response = await subscribe(sub);
      showNotification('success', t('Notifications.PushSubscription'));

    } catch (error) {
      setSubscription(null);
      handleApiError(error, 'subscribing to push notifications');
    }
  }

  async function unsubscribeFromPush() {
    if (!subscription) return;
    try {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      setSubscription(null);

      const response = await unsubscribe(endpoint);
      showNotification('success', t('Notifications.PushUnsubscription'));

    } catch (error) {
      handleApiError(error, 'unsubscribing to push notifications');
    }
  }

  async function testNotifications() {
    if (subscription) {
      try {
        const response = await sendTestNotification();
      } catch (error) {
        handleApiError(error, 'sending test notification');
      }
    }
  }

  if (!isSupported) {
    return (
      <Alert
        icon={<IconAlertCircle size={24} />}
        title={t('Common.Alert')}
        color="red"
        radius={'lg'}
        styles={{
          label: { fontSize: rem(16) },
          message: { fontSize: rem(16) },
          icon: { width: 'calc(1.5rem* var(--mantine-scale))' },
        }}
      >
        {t('SettingsPage.PushNotSupported')}
      </Alert>
    )
  }

  return (
    <Stack p={0} gap={'md'}>
      <Text>{t("SettingsPage.PushSubscriptionInfo")}</Text>
      {subscription ? (
        <Stack>
          <Alert
            icon={<IconCircleCheck size={24} />}
            title={t('SettingsPage.YouAreSubscribed')}
            color="green"
            radius={'lg'}
            mb={'md'}
            styles={{
              label: { fontSize: rem(16) },
              message: { fontSize: rem(16) },
              icon: { width: 'calc(1.5rem* var(--mantine-scale))' },
            }}
          ></Alert>
          <Button color='red' leftSection={<IconBellOff size={20} />} onClick={unsubscribeFromPush}>
            {t("SettingsPage.Unsubscribe")}
          </Button>
          <Button leftSection={<IconSend size={20} />} onClick={testNotifications}>
            {t("SettingsPage.TestNotification")}
          </Button>
        </Stack>
      ) : (
        <Stack>
          <Alert
            icon={<IconCircleX size={24} />}
            title={t("SettingsPage.YouAreNotSubscribed")}
            color="red"
            radius={'lg'}
            mb={'md'}
            styles={{
              label: { fontSize: rem(16) },
              message: { fontSize: rem(16) },
              icon: { width: 'calc(1.5rem* var(--mantine-scale))' },
            }}
          ></Alert>
          <Button leftSection={<IconBellRingingFilled size={20} />} onClick={subscribeToPush}>
            {t("SettingsPage.Subscribe")}
          </Button>
        </Stack>
      )}
    </Stack>
  )
}