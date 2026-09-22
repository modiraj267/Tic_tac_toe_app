import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, NativeModules } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Sound logic disabled due to Native Module compatibility issues on Android.

import GameBoard from '../components/GameBoard';
import PlayerPillar from '../components/PlayerPillar';
import PlayerIcon from '../components/PlayerIcon';
import Confetti from '../components/Confetti';
import { checkWinner, checkDraw } from '../utils/gameLogic';
import { getComputerMove } from '../services/geminiService';
import { colors } from '../styles/colors';

const { width, height } = Dimensions.get('window');

const GameScreen = ({ navigation, route }) => {
  const mode = route?.params?.mode || 'pvp';

  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winnerData, setWinnerData] = useState(null); // { winner: 'X', pattern: [] }
  const [isDraw, setIsDraw] = useState(false);
  const [xPieces, setXPieces] = useState(5);
  const [oPieces, setOPieces] = useState(5);
  const [isComputerThinking, setIsComputerThinking] = useState(false);

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [animPiece, setAnimPiece] = useState(null); // { player, source, dest }

  // Layout registries
  const cellLayouts = useRef({});
  const pillarLayouts = useRef({ X: {}, O: {} });

  // Animated values
  const moveAnimX = useRef(new Animated.Value(0)).current;
  const moveAnimY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const turnIndicatorRot = useRef(new Animated.Value(0)).current;
  const resultScaleAnim = useRef(new Animated.Value(0)).current;
  const lineScaleAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const turnScaleAnim = useRef(new Animated.Value(1)).current;
  const buttonPulseAnim = useRef(new Animated.Value(1)).current;
  const newGamePressAnim = useRef(new Animated.Value(1)).current;

  // Continuous Animations Loop (Title & Button)
  useEffect(() => {
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

    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (winnerData || isDraw) {
      resultScaleAnim.setValue(0);
      Animated.spring(resultScaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 60,
        useNativeDriver: true,
      }).start();

      if (winnerData) {
        lineScaleAnim.setValue(0);
        Animated.spring(lineScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }).start();

        playWinSound();
      }
    }
  }, [winnerData, isDraw]);

  const playSwooshSound = () => {
    if (NativeModules.SimpleSound) NativeModules.SimpleSound.playSwoosh();
  };

  const playDropSound = () => {
    if (NativeModules.SimpleSound) NativeModules.SimpleSound.playDrop();
  };

  const playWinSound = () => {
    if (NativeModules.SimpleSound) NativeModules.SimpleSound.playWin();
  };

  const handleRegisterCell = (index, layout) => {
    cellLayouts.current[index] = layout;
  };

  const handleRegisterPillarItem = (player, index, layout) => {
    pillarLayouts.current[player][index] = layout;
  };

  const animateTurnChange = () => {
    playSwooshSound(); // Add sound when turn changes

    turnIndicatorRot.setValue(0);
    turnScaleAnim.setValue(1);
    
    Animated.parallel([
      Animated.timing(turnIndicatorRot, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)), // Gives a nice 3D pop effect
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(turnScaleAnim, { toValue: 1.3, duration: 250, useNativeDriver: true }),
        Animated.timing(turnScaleAnim, { toValue: 1, duration: 250, useNativeDriver: true })
      ])
    ]).start();
  };

  const handleCellPress = (index) => {
    // Edge cases
    if (board[index] !== null) return;
    if (winnerData || isDraw) return;
    if (isAnimating) return;
    if (isComputerThinking && currentPlayer === 'X') return; // Prevent human from tapping while computer thinks
    if (currentPlayer === 'X' && xPieces <= 0) return;
    if (currentPlayer === 'O' && oPieces <= 0) return;

    // Determine piece source
    const pieceIndex = currentPlayer === 'X' ? xPieces - 1 : oPieces - 1;
    const source = pillarLayouts.current[currentPlayer][pieceIndex];
    const dest = cellLayouts.current[index];

    if (!source || !dest) {
      // Fallback if layout not measured properly
      updateBoard(index);
      return;
    }

    // Start animation
    setIsAnimating(true);
    // Set initial positions relative to screen (approximate by centering in the dest)
    // Actually source and dest are from measure(), which is screen absolute if we are lucky,
    // but Android measure can be relative to window.

    // Calculate translation
    const startX = source.x;
    const startY = source.y;

    // Destination center
    const destX = dest.x + (dest.width - source.width) / 2;
    const destY = dest.y + (dest.height - source.height) / 2;

    setAnimPiece({
      player: currentPlayer,
      x: startX,
      y: startY,
    });

    // Decrement piece count immediately so it disappears from the pillar during flight
    if (currentPlayer === 'X') setXPieces(prev => prev - 1);
    else setOPieces(prev => prev - 1);

    moveAnimX.setValue(0);
    moveAnimY.setValue(0);
    scaleAnim.setValue(1);

    playSwooshSound();

    Animated.parallel([
      Animated.timing(moveAnimX, {
        toValue: destX - startX,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(moveAnimY, {
        toValue: destY - startY,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.5, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true })
      ])
    ]).start(() => {
      playDropSound();
      setAnimPiece(null);
      setIsAnimating(false);
      updateBoard(index);
    });
  };

  const updateBoard = (index) => {
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const win = checkWinner(newBoard);
    if (win) {
      setWinnerData(win);
    } else if (checkDraw(newBoard)) {
      setIsDraw(true);
    } else {
      setCurrentPlayer(prev => prev === 'X' ? 'O' : 'X');
      animateTurnChange();
    }
  };

  const handleRestart = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinnerData(null);
    setIsDraw(false);
    setIsComputerThinking(false);
    setXPieces(5);
    setOPieces(5);
    animateTurnChange();
  };

  const handleNewGamePressIn = () => {
    Animated.spring(newGamePressAnim, {
      toValue: 0.85,
      useNativeDriver: true,
    }).start();
  };

  const handleNewGamePressOut = () => {
    Animated.spring(newGamePressAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    
    // Play sounds for tactile feedback
    playSwooshSound();
    playDropSound();
    handleRestart();
  };

  const flip3D = turnIndicatorRot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const getWinningLine = () => {
    if (!winnerData || !winnerData.pattern) return null;
    const [p1, , p3] = winnerData.pattern;
    const cell1 = cellLayouts.current[p1];
    const cell3 = cellLayouts.current[p3];

    if (!cell1 || !cell3) return null;

    const cx1 = cell1.x + cell1.width / 2;
    const cy1 = cell1.y + cell1.height / 2;
    const cx3 = cell3.x + cell3.width / 2;
    const cy3 = cell3.y + cell3.height / 2;

    const length = Math.sqrt(Math.pow(cx3 - cx1, 2) + Math.pow(cy3 - cy1, 2)) + cell1.width * 0.8;
    const angle = Math.atan2(cy3 - cy1, cx3 - cx1);

    const midX = (cx1 + cx3) / 2;
    const midY = (cy1 + cy3) / 2;

    return {
      length,
      angle: `${angle}rad`,
      midX,
      midY,
    };
  };

  const winningLineInfo = getWinningLine();

  useEffect(() => {
    if (mode === 'computer' && currentPlayer === 'O' && !winnerData && !isDraw && !isAnimating) {
      const abortController = new AbortController();
      let isMounted = true;
      
      const makeComputerMove = async () => {
        setIsComputerThinking(true);
        try {
          const move = await getComputerMove(board, abortController.signal);
          if (isMounted && !abortController.signal.aborted && move !== null) {
            handleCellPress(move);
          }
        } catch (e) {
          // ignore aborts
        } finally {
          if (isMounted) {
            setIsComputerThinking(false);
          }
        }
      };

      // Add a tiny delay to ensure React state updates and animations flush cleanly
      const timeout = setTimeout(() => {
        makeComputerMove();
      }, 50);

      return () => {
        isMounted = false;
        clearTimeout(timeout);
        abortController.abort();
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, currentPlayer, winnerData, isDraw, isAnimating]);

  const titleFloat = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10]
  });

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation?.navigate('GameMode')}
      >
        <Text style={styles.backButtonText}>← Menu</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.titleContainer, { transform: [{ translateY: titleFloat }] }]}>
        <Text style={styles.title}>
          <Text style={[styles.titleNeon, { color: colors.xColor, textShadowColor: colors.xColor }]}>TIC </Text>
          <Text style={styles.titleNeon}>TAC </Text>
          <Text style={[styles.titleNeon, { color: colors.oColor, textShadowColor: colors.oColor }]}>TOE</Text>
        </Text>
        <Text style={styles.modeIndicatorText}>
          {mode === 'pvp' ? '1 VS 1' : 'VS COMPUTER'}
        </Text>
      </Animated.View>

      <View style={styles.topInfoArea}>
        {!winnerData && !isDraw ? (
          <Animated.View style={[
            styles.turnContainer, 
            { 
              transform: [{ scale: turnScaleAnim }],
              borderColor: isComputerThinking ? colors.oColor : (currentPlayer === 'X' ? colors.xColor : colors.oColor),
              shadowColor: isComputerThinking ? colors.oColor : (currentPlayer === 'X' ? colors.xColor : colors.oColor),
            }
          ]}>
            {isComputerThinking ? (
              <Text style={[styles.turnText, { color: colors.oColor }]}>🤖 Computer is thinking...</Text>
            ) : (
              <>
                <Text style={styles.turnText}>Player </Text>
                <Animated.View style={{ transform: [{ rotateY: flip3D }], marginHorizontal: 8 }}>
                  <PlayerIcon player={currentPlayer} size={22} />
                </Animated.View>
                <Text style={styles.turnText}>'s Turn</Text>
              </>
            )}
          </Animated.View>
        ) : (
          <Animated.View style={[styles.resultContainer, { transform: [{ scale: resultScaleAnim }] }]}>
            {winnerData ? (
              <Text style={styles.winnerText}>{winnerData.winner} WINS!</Text>
            ) : (
              <Text style={styles.winnerText}>IT'S A DRAW!</Text>
            )}
          </Animated.View>
        )}
      </View>

      <View style={styles.gameArea}>
        <PlayerPillar
          player="X"
          pieces={xPieces}
          onRegisterItem={handleRegisterPillarItem}
        />

        <View style={styles.boardWrapper}>
          <GameBoard
            board={board}
            onCellPress={handleCellPress}
            onRegisterCellLayout={handleRegisterCell}
            winningPattern={winnerData?.pattern}
          />
        </View>

        <PlayerPillar
          player="O"
          pieces={oPieces}
          onRegisterItem={handleRegisterPillarItem}
        />
      </View>

      <View style={styles.infoArea}>
        <Animated.View style={{ transform: [{ scale: buttonPulseAnim }, { scale: newGamePressAnim }] }}>
          <TouchableOpacity 
            style={styles.button} 
            activeOpacity={1}
            onPressIn={handleNewGamePressIn}
            onPressOut={handleNewGamePressOut}
          >
            <Text style={styles.buttonText}>NEW GAME</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Temporary Animated Layer */}
      {animPiece && (
        <Animated.View style={[
          styles.animatedPiece,
          {
            left: animPiece.x,
            top: animPiece.y,
            transform: [
              { translateX: moveAnimX },
              { translateY: moveAnimY },
              { scale: scaleAnim }
            ]
          }
        ]}>
          <PlayerIcon player={animPiece.player} size={30} />
        </Animated.View>
      )}

      {/* Winning Line Overlay */}
      {winningLineInfo && (
        <Animated.View style={{
          position: 'absolute',
          left: winningLineInfo.midX - winningLineInfo.length / 2,
          top: winningLineInfo.midY - 4,
          width: winningLineInfo.length,
          height: 8,
          backgroundColor: '#FFD700',
          borderRadius: 4,
          zIndex: 999,
          elevation: 10,
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          transform: [
            { rotate: winningLineInfo.angle },
            { scaleX: lineScaleAnim }
          ]
        }} />
      )}

      {/* Confetti Animation */}
      {winnerData && <Confetti />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingTop: 40,
  },
  titleContainer: {
    marginBottom: 10,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.secondaryText,
    fontSize: 14,
    fontWeight: 'bold',
  },
  modeIndicatorText: {
    color: colors.secondaryText,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -5,
    letterSpacing: 2,
  },
  topInfoArea: {
    alignItems: 'center',
    minHeight: 60,
    marginBottom: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 4,
  },
  titleNeon: {
    color: '#ffffff',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  gameArea: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '90%',
    maxWidth: 400,
    height: width * 0.8, // Make it roughly square based on width
    maxHeight: 400,
  },
  boardWrapper: {
    flex: 1,
    marginHorizontal: 15,
    justifyContent: 'center',
  },
  infoArea: {
    marginTop: 50,
    alignItems: 'center',
  },
  turnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e', // Dark pill background
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  turnText: {
    fontSize: 20,
    color: colors.text,
    fontWeight: '600',
    letterSpacing: 1,
  },
  resultContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  winnerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700', // Gold for win
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  button: {
    backgroundColor: colors.buttonBackground,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  animatedPiece: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 999, // Crucial for Android to render above the board!
  }
});

export default GameScreen;
