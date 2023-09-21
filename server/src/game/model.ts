import { Vector3, rotateVector3 } from "shared";

export const PLAYER_WIDTH = 10;
export const PLAYER_DEPTH = 10;
export const PLAYER_HEIGHT = 5;
export const STAGE_WIDTH = 800;

export interface GameObject {
  id: number;

  position: Vector3;

  rotation: Vector3;
}

export class Player implements GameObject {
  id: number;

  HP = 3;

  score = 0;

  previousPosition: Vector3;

  position: Vector3;

  rotation: Vector3;

  jumpPower = 10;

  isJumping = false;

  isDead = false;

  constructor(id: number, position: Vector3, rotation: Vector3) {
    this.id = id;
    this.position = position;
    this.previousPosition = { x: position.x, y: position.y, z: position.z };
    this.rotation = rotation;
  }

  setPosition(vector: Vector3) {
    this.position.x = vector.x;
    this.position.y = vector.y;
    this.position.z = vector.z;
  }

  setPreviousPosition(vector: Vector3) {
    this.previousPosition.x = vector.x;
    this.previousPosition.y = vector.y;
    this.previousPosition.z = vector.z;
  }

  changeHP(delta: number) {
    this.HP += delta;
  }
}

export class Bullet implements GameObject {
  id: number;

  owner: Player;

  position: Vector3;

  rotation: Vector3;

  speed = 1.5;

  constructor(owner: Player, position: Vector3, rotation: Vector3) {
    this.id = Math.random();
    this.owner = owner;
    const { x, y, z } = position;
    const { x: rotationX, y: rotationY, z: rotationZ } = rotation;
    this.position = { x, y, z };
    this.rotation = { x: rotationX, y: rotationY, z: rotationZ };
  }

  move() {
    const vector = rotateVector3({ x: 0, y: this.speed, z: 0 }, this.rotation);
    const { x, y, z } = vector;
    this.position.x += x;
    this.position.y += y;
    this.position.z += z;
  }
}
