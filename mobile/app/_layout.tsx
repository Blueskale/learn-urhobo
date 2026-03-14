import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";

import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuthStore } from "@/store/authStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user, isHydrated, hydrate } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const hasNavigated = useRef(false);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      hasNavigated.current = true;
      router.replace("/(auth)/welcome");
    } else if (user && inAuthGroup) {
      hasNavigated.current = true;
      if (!user.profile.onboarding_complete) {
        router.replace("/(auth)/onboarding");
      } else {
        router.replace("/(tabs)/home");
      }
    }
  }, [user, isHydrated, segments]);

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  return <Slot />;
}
