import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const CONFETTI_COUNT = 40;
const COLORS = ['#FFC700', '#FF0055', '#00E5FF', '#00FF66', '#B700FF'];

const ConfettiPiece = ({ index }) => {
  const animY = useRef(new Animated.Value(-50)).current;
  // Initialize X directly as a translation offset
  const initialX = Math.random() * width;
  const animX = useRef(new Animated.Value(0)).current;
  const animRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animY, {
        toValue: height + 50,
        duration: 2500 + Math.random() * 2000,
        useNativeDriver: true,
      }),
      Animated.timing(animX, {
        toValue: (Math.random() * 200 - 100),
        duration: 2500 + Math.random() * 2000,
        useNativeDriver: true,
      }),
      Animated.timing(animRotate, {
        toValue: 1,
        duration: 2500 + Math.random() * 2000,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const spin = animRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${360 + Math.random() * 720}deg`]
  });

  const size = 10 + Math.random() * 10;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: initialX,
        width: size,
        height: size,
        backgroundColor: COLORS[index % COLORS.length],
        transform: [
          { translateY: animY },
          { translateX: animX },
          { rotate: spin }
        ]
      }}
    />
  );
};

const Confetti = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </View>
  );
};

export default Confetti;
