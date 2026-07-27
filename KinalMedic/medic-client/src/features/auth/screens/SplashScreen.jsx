import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
} from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";

const logo = require("../../../../assets/img/Logo_Enfermeria_Kinal.png");

const REFLECTIONS = [
  "Cuidar es un acto de valentía y de esperanza.",
  "Cada vida que atiendes deja una huella de bondad.",
  "La salud no es solo un servicio: es un compromiso con el prójimo.",
  "En cada emergencia hay una oportunidad de servir con el corazón.",
  "Kinal forma profesionales; Kinal Medic cuida a su comunidad.",
];

const SplashScreen = ({ onFinish }) => {
  const logoOp = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(16)).current;
  const titleOp = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(14)).current;
  const quoteOp = useRef(new Animated.Value(0)).current;
  const quoteY = useRef(new Animated.Value(12)).current;
  const screenOp = useRef(new Animated.Value(1)).current;
  const ring = useRef(new Animated.Value(0)).current;

  const [quote] = useState(
    () => REFLECTIONS[Math.floor(Math.random() * REFLECTIONS.length)]
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOp, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.timing(logoY, {
        toValue: 0,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const tTitle = setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOp, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 900);

    const tQuote = setTimeout(() => {
      Animated.parallel([
        Animated.timing(quoteOp, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(quoteY, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 1700);

    const ringLoop = Animated.loop(
      Animated.timing(ring, {
        toValue: 1,
        duration: 2200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );
    ringLoop.start();

    const tExit = setTimeout(() => {
      Animated.timing(screenOp, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }).start(() => onFinish?.());
    }, 1700 + 3500);

    return () => {
      clearTimeout(tTitle);
      clearTimeout(tQuote);
      clearTimeout(tExit);
      ringLoop.stop();
    };
  }, [
    logoOp,
    logoY,
    titleOp,
    titleY,
    quoteOp,
    quoteY,
    screenOp,
    ring,
    onFinish,
  ]);

  const ringScale = ring.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1.85],
  });
  const ringOpacity = ring.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0],
  });

  return (
    <Animated.View style={[styles.root, { opacity: screenOp }]}>
      <Animated.View
        style={[
          styles.ring,
          { opacity: ringOpacity, transform: [{ scale: ringScale }] },
        ]}
      />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoWrap,
            { opacity: logoOp, transform: [{ translateY: logoY }] },
          ]}
        >
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.View
          style={{
            opacity: titleOp,
            transform: [{ translateY: titleY }],
            alignItems: "center",
          }}
        >
          <Text style={styles.title}>Kinal Medic</Text>
          <Text style={styles.tagline}>
            Enfermería institucional · Fundación Kinal
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.quoteBox,
            { opacity: quoteOp, transform: [{ translateY: quoteY }] },
          ]}
        >
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.quote}>{quote}</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: COLORS.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  ring: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  content: {
    alignItems: "center",
    maxWidth: 360,
    width: "100%",
  },
  logoWrap: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 20,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  logo: {
    height: 72,
    width: 180,
  },
  title: {
    fontSize: FONT_SIZE.huge,
    fontWeight: "900",
    color: COLORS.surface,
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.xs,
    color: "#bfdbfe",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  quoteBox: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: SPACING.md,
    width: "100%",
    marginTop: SPACING.sm,
  },
  quoteMark: {
    position: "absolute",
    top: 4,
    left: 12,
    fontSize: 32,
    color: "rgba(125, 211, 252, 0.45)",
  },
  quote: {
    color: "#e0f2fe",
    fontSize: FONT_SIZE.sm,
    lineHeight: 22,
    fontStyle: "italic",
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: SPACING.sm,
  },
});

export default SplashScreen;
