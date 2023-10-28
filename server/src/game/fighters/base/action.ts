import { Vector3 } from "shared";
import BaseFighter from ".";
import { FIGHTER_HEIGHT } from "../../model";

export interface BaseFighterAction {
  actor: BaseFighter;

  isCompleted: boolean;

  tick(delta: number): void;
}

export class MoveAction implements BaseFighterAction {
  actor: BaseFighter;

  isCompleted = false;

  vector: Vector3;

  constructor(fighter: BaseFighter, vector: Vector3) {
    fighter.setAction("move");
    this.actor = fighter;
    this.vector = vector;
  }

  tick(delta: number) {
    this.actor.setPreviousPosition(this.actor.position);
    this.actor.position.x += this.vector.x * delta;
    this.actor.position.y += this.vector.y * delta;
    this.actor.position.z += this.vector.z * delta;
    this.isCompleted = true;
  }
}

export class RotateAction implements BaseFighterAction {
  actor: BaseFighter;

  isCompleted = false;

  rotation: Vector3;

  constructor(fighter: BaseFighter, rotation: Vector3) {
    fighter.setAction("rotate");
    this.actor = fighter;
    this.rotation = rotation;
  }

  tick(delta: number) {
    this.actor.rotation.x += this.rotation.x * delta;
    this.actor.rotation.y += this.rotation.y * delta;
    this.actor.rotation.z += this.rotation.z * delta;
    this.isCompleted = true;
  }
}

export class JumpAction implements BaseFighterAction {
  actor: BaseFighter;

  isCompleted = false;

  verticalVelocity = 0;

  constructor(fighter: BaseFighter) {
    this.actor = fighter;
    if (fighter.isJumping) {
      this.isCompleted = true;
    } else {
      this.verticalVelocity = fighter.jumpPower;
      this.actor.isJumping = true;
    }
  }

  tick(delta: number): void {
    this.actor.position.z += this.verticalVelocity * delta * 0.01;
    this.verticalVelocity -= delta * 0.001 * 9.8;
    if (this.actor.position.z <= FIGHTER_HEIGHT / 2) {
      this.actor.position.z = FIGHTER_HEIGHT / 2;
      this.isCompleted = true;
      this.actor.isJumping = false;
    }
  }
}
