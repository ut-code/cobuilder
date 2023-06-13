import { Vector3 } from "../utils/vector3";
import { Player, PLAYER_HEIGHT } from "../common/model";

export interface PlayerAction {
  actor: Player;

  isCompleted: boolean;

  tick(delta: number): void;
}

export class MoveAction implements PlayerAction {
  actor: Player;

  isCompleted = false;

  vector: Vector3;

  constructor(player: Player, vector: Vector3) {
    this.actor = player;
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

export class RotateAction implements PlayerAction {
  actor: Player;

  isCompleted = false;

  rotation: Vector3;

  constructor(player: Player, rotation: Vector3) {
    this.actor = player;
    this.rotation = rotation;
  }

  tick(delta: number) {
    this.actor.rotation.x += this.rotation.x * delta;
    this.actor.rotation.y += this.rotation.y * delta;
    this.actor.rotation.z += this.rotation.z * delta;
    this.isCompleted = true;
  }
}

export class JumpAction implements PlayerAction {
  actor: Player;

  isCompleted = false;

  verticalVelocity: number;

  constructor(player: Player) {
    this.actor = player;
    this.verticalVelocity = player.jumpPower;
  }

  tick(delta: number): void {
    this.actor.position.z += this.verticalVelocity * delta * 0.001;
    this.verticalVelocity -= delta * 0.001 * 9.8;
    if (this.actor.position.z <= PLAYER_HEIGHT / 2) {
      this.actor.position.z = PLAYER_HEIGHT / 2;
      this.isCompleted = true;
    }
  }
}
