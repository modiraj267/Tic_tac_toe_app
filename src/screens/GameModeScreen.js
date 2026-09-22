import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';

const ModeCard = ({ title, subtitle, onPress, index, glowColor }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current; // Start at 0 for entrance pop
  const translateY = useRef(new Animated.Value(50)).current;
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    // Staggered entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: index * 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay: index * 200,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      })
    ]).start();
  }, [index, scaleAnim, translateY]);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    // Slight delay to see the glow pop back before navigating
    setTimeout(onPress, 100);
  };

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }, { translateY }] }]}>
      <TouchableOpacity
        style={[
          styles.card,
          isPressed && { borderColor: glowColor, shadowColor: glowColor, shadowOpacity: 0.8, shadowRadius: 15, elevation: 12 }
        ]}
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text style={[styles.cardTitle, isPressed && { color: glowColor }]}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const GameModeScreen = ({ navigation }) => {
  const titleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Title floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(titleAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    // Subtitle fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, [titleAnim, fadeAnim]);

  const titleFloat = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10]
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={{ transform: [{ translateY: titleFloat }] }}>
          <Text style={styles.title}>
            <Text style={[styles.titleNeon, { color: colors.xColor, textShadowColor: colors.xColor }]}>TIC </Text>
            <Text style={styles.titleNeon}>TAC </Text>
            <Text style={[styles.titleNeon, { color: colors.oColor, textShadowColor: colors.oColor }]}>TOE</Text>
          </Text>
        </Animated.View>
        <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>Choose Game Mode</Animated.Text>
      </View>

      <View style={styles.modesContainer}>
        <ModeCard
          title="👤 1 VS 1"
          subtitle="Player vs Player"
          index={0}
          glowColor={colors.xColor}
          onPress={() => navigation.navigate('Game', { mode: 'pvp' })}
        />
        
        <ModeCard
          title="🤖 COMPUTER"
          subtitle="Player vs AI"
          index={1}
          glowColor={colors.oColor}
          onPress={() => navigation.navigate('Game', { mode: 'computer' })}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 80,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 20,
  },
  titleNeon: {
    color: '#ffffff',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 18,
    color: colors.secondaryText,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  modesContainer: {
    width: '100%',
    maxWidth: 350,
    paddingHorizontal: 20,
  },
  cardWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#1e1e1e',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    fontWeight: '500',
  }
});

export default GameModeScreen;
