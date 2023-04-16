/* eslint-disable */
// イメージです

interface GameObject {
  position: { x: number; y: number; z: number };
}

interface Item extends GameObject {
  owner: Player;
}

interface Player extends GameObject {
  id: number;
  username: string;
}
