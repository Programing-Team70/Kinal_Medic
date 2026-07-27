import { useCallback, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { COLORS } from "../shared/constants/theme";
import { useAuthStore } from "../shared/store/authStore";
import MedicalBackground from "../shared/components/MedicalBackground";
import SplashScreen from "../features/auth/screens/SplashScreen";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";

const AppNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state._hasHydrated);
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <MedicalBackground />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <View style={styles.root}>
      <MedicalBackground />
      <View style={styles.foreground}>
        <NavigationContainer>
          {isAuthenticated ? <MainTabs /> : <AuthStack />}
        </NavigationContainer>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  foreground: {
    flex: 1,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eef5ff",
  },
});

export default AppNavigator;
