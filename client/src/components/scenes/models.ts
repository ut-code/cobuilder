import * as THREE from "three";

export type SceneType = "login" | "main";

export abstract class Scene {
  onSceneDestroyed?(sceneType: SceneType): void;
}

export interface GameObject {
  position: Vector3;

  rotation: Vector3;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Renderer {
  threeScene: THREE.Scene;

  render(): void;

  destroy(): void;
}
