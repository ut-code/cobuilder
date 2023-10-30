import { Vector3, rotateVector3 } from "shared";
import { GameObject } from "../../model";
import BaseFighter from ".";

export default class Bullet implements GameObject {
  id: number;

  owner: BaseFighter;

  position: Vector3;

  rotation: Vector3;

  speed = 1.5;

  constructor(owner: BaseFighter, position: Vector3, rotation: Vector3) {
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
