import React from 'react';
import { Image } from 'react-native';
import Matter from 'matter-js';

// Import the bird image
import BirdImage from '../assets/bird1.png';

const Bird = (props) => {
  const { body } = props;
  const widthBody = body.bounds.max.x - body.bounds.min.x;
  const heightBody = body.bounds.max.y - body.bounds.min.y;

  const xBody = body.position.x - widthBody / 2;
  const yBody = body.position.y - heightBody / 2;

  return (
    <Image
      source={BirdImage} // Use the imported bird image
      style={{
        position: 'absolute',
        left: xBody,
        top: yBody,
        width: widthBody,
        height: heightBody,
      }}
    />
  );
};

export default (world, color, pos, size) => {
  const initialBird = Matter.Bodies.rectangle(
    pos.x,
    pos.y,
    size.width,
    size.height,
    { label: 'Bird' }
  );

  Matter.World.add(world, [initialBird]);

  return {
    body: initialBird,
    color,
    pos,
    renderer: <Bird />,
  };
};
