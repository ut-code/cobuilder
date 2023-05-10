import * as THREE from "three";

export type SceneType = "login" | "main";

export abstract class Scene {
  onSceneDestroyed?(sceneType: SceneType): void;
}

export abstract class SceneRenderer {
  protected webGLRenderer: THREE.WebGLRenderer;

  protected threeScene: THREE.Scene;

  camera: THREE.PerspectiveCamera;

  constructor(canvas: HTMLCanvasElement) {
    this.webGLRenderer = new THREE.WebGLRenderer({ canvas });
    this.threeScene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
  }

  render() {
    this.webGLRenderer.render(this.threeScene, this.camera);
  }

  destroy() {
    this.webGLRenderer.dispose();
  }
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
  render(): void;
}
