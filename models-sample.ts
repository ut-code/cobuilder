/* eslint-disable */
// イメージです

interface GameObject {
  position: { x: number; y: number; z: number };
}

interface Item extends GameObject {
  owner: Fighter;
}

interface Fighter extends GameObject {
  id: number;
  username: string;
}
