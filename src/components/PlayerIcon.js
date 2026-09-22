import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

const PlayerIcon = ({ player, size = 40 }) => {
  if (player === 'X') {
    return (
      <View style={[styles.iconContainer, { width: size, height: size }]}>
        <View style={[styles.xLine, { backgroundColor: colors.xColor, transform: [{ rotate: '45deg' }] }]} />
        <View style={[styles.xLine, { backgroundColor: colors.xColor, transform: [{ rotate: '-45deg' }] }]} />
      </View>
    );
  }

  if (player === 'O') {
    return (
      <View style={[styles.iconContainer, { width: size, height: size }]}>
        <View style={[styles.oCircle, { borderColor: colors.oColor, width: size * 0.8, height: size * 0.8, borderRadius: (size * 0.8) / 2, borderWidth: size * 0.15 }]} />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  xLine: {
    position: 'absolute',
    width: '100%',
    height: '15%',
    borderRadius: 5,
  },
  oCircle: {
    position: 'absolute',
  },
});

export default PlayerIcon;
