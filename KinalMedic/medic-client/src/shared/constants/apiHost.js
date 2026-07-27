import { Platform } from "react-native";
import Constants from "expo-constants";

function hostFromExpoUri(raw) {
  if (!raw) return null;
  try {
    const cleaned = String(raw)
      .replace(/^exp:\/\//, "")
      .replace(/^exps:\/\//, "")
      .replace(/^https?:\/\//, "");
    const host = cleaned.split(":")[0]?.split("/")[0]?.trim();
    if (
      host &&
      host !== "localhost" &&
      host !== "127.0.0.1" &&
      host !== "0.0.0.0" &&
      (host.includes(".") || host === "10.0.2.2")
    ) {
      return host;
    }
  } catch {
    return null;
  }
  return null;
}

export function resolveApiHost() {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.manifest2?.extra?.expoGo?.debuggerHost,
    Constants.manifest?.debuggerHost,
    Constants.linkingUri,
    Constants.experienceUrl,
  ];

  for (const c of candidates) {
    const h = hostFromExpoUri(c);
    if (h) return `http://${h}`;
  }

  const envHost = process.env.EXPO_PUBLIC_API_HOST;
  if (envHost && String(envHost).trim()) {
    return String(envHost).replace(/\/$/, "").trim();
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2";
  }

  return "http://localhost";
}

export function getApiHost() {
  return resolveApiHost();
}

export const API_HOST = resolveApiHost();
