import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from "react-native";
import { COLORS } from "../constants/theme";

const { width, height } = Dimensions.get("window");

const CROSSES = [
  { top: "10%", left: "8%", size: 42, delay: 0 },
  { top: "22%", right: "10%", size: 28, delay: 400 },
  { top: "48%", left: "15%", size: 36, delay: 800 },
  { top: "65%", right: "18%", size: 24, delay: 200 },
  { top: "78%", left: "42%", size: 32, delay: 600 },
  { top: "35%", right: "28%", size: 22, delay: 1000 },
];

const MedicalBackground = () => {
  const anims = useRef(CROSSES.map(() => new Animated.Value(0))).current;
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops = anims.map((val, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(CROSSES[i].delay),
          Animated.timing(val, {
            toValue: 1,
            duration: 3200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 3200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      )
    );

    const orbLoop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(orb1, {
          toValue: 1,
          duration: 9000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(orb1, {
          toValue: 0,
          duration: 9000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const orbLoop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(orb2, {
          toValue: 1,
          duration: 11000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(orb2, {
          toValue: 0,
          duration: 11000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    loops.forEach((l) => l.start());
    orbLoop1.start();
    orbLoop2.start();

    return () => {
      loops.forEach((l) => l.stop());
      orbLoop1.stop();
      orbLoop2.stop();
    };
  }, [anims, orb1, orb2]);

  return (
    <View style={styles.root} pointerEvents="none">
      <View style={styles.base} />

      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          {
            transform: [
              {
                translateY: orb1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 28],
                }),
              },
              {
                translateX: orb1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 18],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          {
            transform: [
              {
                translateY: orb2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -24],
                }),
              },
              {
                translateX: orb2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -16],
                }),
              },
            ],
          },
        ]}
      />

      {CROSSES.map((c, i) => {
        const translateY = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -14],
        });
        const opacity = anims[i].interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.12, 0.28, 0.12],
        });
        const rotate = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "10deg"],
        });

        return (
          <Animated.Text
            key={i}
            style={[
              styles.cross,
              {
                top: c.top,
                left: c.left,
                right: c.right,
                fontSize: c.size,
                opacity,
                transform: [{ translateY }, { rotate }],
              },
            ]}
          >
            +
          </Animated.Text>
        );
      })}

      <View style={styles.pulseLine} />
      <View style={[styles.pulseLine, styles.pulseLine2]} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: "hidden",
  },
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#eef5ff",
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.45,
  },
  orb1: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: "rgba(8, 49, 109, 0.12)",
    top: -width * 0.2,
    left: -width * 0.15,
  },
  orb2: {
    width: width * 0.55,
    height: width * 0.55,
    backgroundColor: "rgba(14, 165, 233, 0.14)",
    bottom: height * 0.08,
    right: -width * 0.12,
  },
  cross: {
    position: "absolute",
    color: COLORS.primary,
    fontWeight: "200",
  },
  pulseLine: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "22%",
    height: 2,
    backgroundColor: "rgba(8, 49, 109, 0.06)",
  },
  pulseLine2: {
    bottom: "38%",
    backgroundColor: "rgba(14, 165, 233, 0.06)",
  },
});

export default MedicalBackground;
