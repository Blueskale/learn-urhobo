import { Redirect } from "expo-router";
import React from "react";

import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuthStore } from "@/store/authStore";

export default function Index() {
  const { user, isHydrated } = useAuthStore();

  if (!isHydrated) return <LoadingScreen />;

  if (!user) return <Redirect href="/(auth)/welcome" />;

  if (!user.profile.onboarding_complete) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
