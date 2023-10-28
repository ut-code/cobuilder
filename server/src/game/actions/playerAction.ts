import { Player } from "../model";

export interface PlayerAction {
  actor: Player;

  isCompleted: boolean;

  tick(delta: number): void;
}
