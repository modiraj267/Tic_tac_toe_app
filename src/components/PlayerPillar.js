import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import PlayerIcon from './PlayerIcon';
import { colors } from '../styles/colors';

const PillarItem = ({ player, index, isVisible, onRegister }) => {
  const viewRef = useRef(null);
  
  return (
    <View
      style={styles.pieceContainer}
      ref={viewRef}
      onLayout={() => {
        setTimeout(() => {
          viewRef.current?.measure((fx, fy, w, h, px, py) => {
            if (onRegister) {
              onRegister(player, index, { x: px, y: py, width: w, height: h });
            }
          });
        }, 150);
      }}
    >
      <View style={{ opacity: isVisible ? 1 : 0 }}>
        <PlayerIcon player={player} size={30} />
      </View>
    </View>
  );
};

const PlayerPillar = ({ player, pieces, onRegisterItem }) => {
  return (
    <View style={styles.pillarContainer}>
      <View style={styles.section}>
        {Array.from({ length: 5 }).map((_, i) => (
          <PillarItem
            key={`${player}-${i}`}
            player={player}
            index={i}
            isVisible={i < pieces}
            onRegister={onRegisterItem}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pillarContainer: {
    width: 60,
    backgroundColor: colors.pillarBackground,
    borderRadius: 15,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  section: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  pieceContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    width: '80%',
    height: 2,
    backgroundColor: colors.cellBackground,
    marginVertical: 10,
  }
});

export default PlayerPillar;
