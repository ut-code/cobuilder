import { FighterActions, Vector3 } from "shared";
import { GameObject } from "../../model";

export default class BaseFighter implements GameObject {
  id: number;

  HP = 3;

  score = 0;

  previousPosition: Vector3;

  position: Vector3;

  rotation: Vector3;

  jumpPower = 10;

  currentAction: FighterActions = "idle";

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

  setAction(action: FighterActions) {
    this.currentAction = action;
  }
}
