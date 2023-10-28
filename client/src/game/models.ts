import * as THREE from "three";

import { Vector3 } from "shared";

export type SceneType = "login" | "main" | "lobby";

export interface GameObject {
  id: number;

  position: Vector3;

  rotation: Vector3;
}

export interface Renderer {
  threeScene: THREE.Scene;

  render?(): void;

  destroy(): void;
}
