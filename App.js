import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View, Alert, StyleSheet } from 'react-native';
import { GameEngine, Matter } from 'react-native-game-engine';
import entities from './entities';
import Physics from './physics';
import { Pedometer } from 'expo-sensors';

const ALERT_TIMEOUT = 2000; // 6 seconds
let alertShown = false;

// Scoreboard component
const Scoreboard = ({ currentPoints, goal }) => {
  return (
    <View style={styles.scoreboardContainer}>
      <Text style={styles.scoreboardText}>Score: {currentPoints}</Text>
      <Text style={styles.scoreboardText}>Goal: {goal}</Text>
    </View>
  );
};

export default function App() {
  const [running, setRunning] = useState(false);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [PedometerAvailability, setPedometerAvailability] = useState("");
  const [stepCount, updateStepCount] = useState(0);
  const [goal, setGoal] = useState(25); // Set the initial goal value here
  const [obstacleCollision, setObstacleCollision] = useState(false);

  let timeout;
  let subscription = useRef(null); // Declare the subscription variable using useRef
  const gameEngineRef = useRef(null);

  useEffect(() => {
    setRunning(false);
    subscribe();

    return () => {
      unsubscribe();
    };
  }, []);

  const subscribe = () => {
    subscription.current = Pedometer.watchStepCount(result => {
      clearTimeout(timeout); // Clear the previous timeout
      updateStepCount(result.steps);
      timeout = setTimeout(showAlert, ALERT_TIMEOUT);
    });

    Pedometer.isAvailableAsync().then(
      result => {
        setPedometerAvailability(String(result));
      },
      error => {
        setPedometerAvailability(error);
      }
    );
  };

  const unsubscribe = () => {
    subscription.current && subscription.current.remove();
    clearTimeout(timeout); // Clear the timeout when unsubscribing
  };

  const showAlert = (title, message) => {
    if (!alertShown) {
      alertShown = true;
      Alert.alert(
        title,
        message,
        [
          {
            text: 'OK',
            onPress: () => {
              alertShown = false;
              setObstacleCollision(false);
            },
          },
        ]
      );
    }
  };
  

  const handleGameContainerPress = () => {
    if (!running) {
      setCurrentPoints(0);
      setRunning(true);
      gameEngineRef.current.swap(entities());
    }
  };

  const showObstacleCollisionAlert = () => {
    if (!obstacleCollision) {
      setObstacleCollision(true);
      Alert.alert(
        'Obstacle Collision',
        'You touched an obstacle.',
        [{ text: 'OK', onPress: () => setObstacleCollision(false) }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleGameContainerPress} style={styles.gameContainer}>
        <GameEngine
          ref={gameEngineRef}
          systems={[Physics]}
          entities={entities()}
          running={running}

      onEvent={(e) => {
  switch (e.type) {
    case 'game_over':
      setRunning(false);
      gameEngineRef.current?.stop && gameEngineRef.current.stop();
      break;
    case 'new_point':
      setCurrentPoints(currentPoints + 1);
      if (currentPoints + 1 >= goal) {
        // Reset the game when the goal is reached
        setCurrentPoints(0);
        setRunning(false);
        gameEngineRef.current.swap(entities());
      }
      break;
    case 'obstacle_collision':
      if (!obstacleCollision) {
        setObstacleCollision(true);
        showAlert('Obstacle Collision', 'You touched an obstacle.');
      }
      break;
  }
}}

          style={{ flex: 1 }}
        >
          <StatusBar style="auto" hidden={true} />
        </GameEngine>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleGameContainerPress} style={styles.buttonContainer}>
        <Text style={styles.buttonText}>PLAY</Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Is pedometer available on the device: {PedometerAvailability}
        </Text>
        <Text>{stepCount}</Text>
      </View>

      {/* Render the scoreboard */}
      <Scoreboard currentPoints={currentPoints} goal={goal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gameContainer: {
    flex: 1,
    marginBottom: 60,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 30,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    color: 'black',
    backgroundColor: 'rgba(155, 89, 182, 0.5)',
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreboardContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  scoreboardText: {
    color: 'white',
    fontSize: 16,
  },
});
