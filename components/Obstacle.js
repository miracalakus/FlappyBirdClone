import Matter from 'matter-js';
import React from 'react';
import { View, Image } from 'react-native';

const Obstacle = ({ body }) => {
  const { position, bounds } = body;
  const { x, y } = position;
  const { min, max } = bounds;
  const widthBody = max.x - min.x;
  const heightBody = max.y - min.y;

  return (
    <View
      style={{
        position: 'absolute',
        left: x - widthBody / 2,
        top: y - heightBody / 2,
        width: widthBody,
        height: heightBody,
      }}
    >
      <Image
        source={require('../assets/obstacle.png')} // Replace with the path to your obstacle image
        style={{ width: '100%', height: '100%' }}
        resizeMode="stretch" // Adjust the resizeMode based on your preference
      />
    </View>
  );
};

const createObstacle = (world, label, color, pos, size) => {
  const obstacle = Matter.Bodies.rectangle(
    pos.x,
    pos.y,
    size.width,
    size.height,
    {
      label,
      isStatic: true,
    }
  );
  Matter.World.add(world, obstacle);

  const obstacleObject = {
    body: obstacle,
    renderer: <Obstacle body={obstacle} />,
  };

  return obstacleObject;
};

export default createObstacle;