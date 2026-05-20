import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";

export interface FloatingVButtonRef {
  bounce: () => void;
}

interface Props {
  onPress: () => void;
  hasCartItems: boolean;
}

const FloatingVButton = forwardRef<FloatingVButtonRef, Props>(
  ({ onPress, hasCartItems }, ref) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;

    useImperativeHandle(ref, () => ({
      bounce: () => {
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -12,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(bounceAnim, {
            toValue: 0,
            friction: 3,
            tension: 200,
            useNativeDriver: true,
          }),
        ]).start();
      },
    }));

    useEffect(() => {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }, [pulseAnim]);

    useEffect(() => {
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.7,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      );
      glow.start();
      return () => glow.stop();
    }, [glowAnim]);

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.spring(pulseAnim, {
          toValue: 1,
          friction: 3,
          tension: 300,
          useNativeDriver: true,
        }),
      ]).start();
      onPress();
    };

    return (
      <Animated.View
        style={[
          styles.wrapper,
          hasCartItems && styles.wrapperWithCart,
          {
            transform: [
              { scale: pulseAnim },
              { translateY: bounceAnim },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.9}
          style={styles.touchArea}
        >
          <Animated.View style={[styles.glowRing, { opacity: glowAnim }]} />
          <View style={styles.buttonCircle}>
            <View style={styles.innerCircle}>
              <Text style={styles.vLetter}>V</Text>
            </View>
          </View>
          <View style={styles.sparkleTop}>
            <Text style={styles.sparkle}>✦</Text>
          </View>
          <View style={styles.labelBubble}>
            <Text style={styles.labelText}>Ask V</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

export default FloatingVButton;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    right: 16,
    bottom: 24,
    zIndex: 50,
    alignItems: "center",
  },
  wrapperWithCart: {
    bottom: 72,
  },
  touchArea: {
    alignItems: "center",
  },
  glowRing: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#c9a96e",
    top: -4,
  },
  buttonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1e1b16",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#c9a96e",
  },
  innerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#c9a96e",
    alignItems: "center",
    justifyContent: "center",
  },
  vLetter: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111111",
    letterSpacing: 1,
  },
  sparkleTop: {
    position: "absolute",
    top: -8,
    right: -2,
  },
  sparkle: {
    fontSize: 12,
    color: "#c9a96e",
  },
  labelBubble: {
    marginTop: 6,
    backgroundColor: "#1e1b16",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#2e2820",
  },
  labelText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#c9a96e",
    letterSpacing: 0.5,
  },
});
