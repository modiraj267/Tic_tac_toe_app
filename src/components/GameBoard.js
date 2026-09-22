import React from 'react';
import { View, StyleSheet } from 'react-native';
import GameCell from './GameCell';
import { colors } from '../styles/colors';

const GameBoard = ({ board, onCellPress, onRegisterCellLayout, winningPattern }) => {
  return (
    <View style={styles.boardContainer}>
      {board.map((cellValue, index) => (
        <GameCell
          key={index}
          index={index}
          value={cellValue}
          onPress={onCellPress}
          onRegisterLayout={onRegisterCellLayout}
          isWinningCell={winningPattern?.includes(index)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.boardBackground,
    padding: 10,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  }
});

export default GameBoard;
