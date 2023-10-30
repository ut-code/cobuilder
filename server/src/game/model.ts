import {
  CreateUserEventData,
  KeyboardInputsEventData,
  UpdateGameDataEventData,
  Vector3,
} from "shared";

export const FIGHTER_WIDTH = 10;
export const FIGHTER_DEPTH = 10;
export const FIGHTER_HEIGHT = 5;
export const STAGE_WIDTH = 800;

export interface GameObject {
  id: number;

  position: Vector3;

  rotation: Vector3;
}

export type WorkerEvent =
  | UpdateGameDataEventData
  | CreateUserEventData
  | KeyboardInputsEventData;
