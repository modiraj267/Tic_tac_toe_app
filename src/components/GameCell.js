import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Animated, View } from 'react-native';
import PlayerIcon from './PlayerIcon';
import { colors } from '../styles/colors';

const GameCell = ({ value, index, onPress, onRegisterLayout, isWinningCell }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const viewRef = useRef(null);

  useEffect(() => {
    if (isWinningCell) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isWinningCell]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    onPress(index);
  };

  const measureLayout = () => {
    if (viewRef.current && onRegisterLayout) {
      viewRef.current.measure((fx, fy, width, height, px, py) => {
        onRegisterLayout(index, { x: px, y: py, width, height });
      });
    }
  };

  return (
    <View 
      style={styles.cellWrapper}
      ref={viewRef} 
      onLayout={() => setTimeout(measureLayout, 100)}
    >
      <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }, { scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[styles.cell, isWinningCell && styles.winningCell]}
          activeOpacity={0.8}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {value && <PlayerIcon player={value} size={50} />}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  cellWrapper: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.5%',
  },
  cell: {
    flex: 1,
    backgroundColor: colors.cellBackground,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  winningCell: {
    backgroundColor: '#3d3d3d',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
});

export default GameCell;
