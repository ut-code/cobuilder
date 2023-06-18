import * as THREE from "three";

import { Vector3 } from "../utils/vector3";

export type SceneType = "login" | "main";

export abstract class Scene {
  onSceneDestroyed?(sceneType: SceneType): void;
}

export interface GameObject {
  id: number;

  position: Vector3;

  rotation: Vector3;
}

export interface Renderer {
  threeScene: THREE.Scene;

  render(): void;

  destroy(): void;
}
