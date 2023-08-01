import * as THREE from "three";

import { Vector3 } from "../utils/vector3";

export type SceneType = "login" | "main" | "lobby";

export abstract class Scene {
  onSceneDestroyed?(): void;
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

export class CameraRenderer implements Renderer {
  protected camera: THREE.PerspectiveCamera;

  threeScene: THREE.Scene;

  constructor(aspect: number, threeScene: THREE.Scene) {
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    console.log(this.camera);
    this.threeScene = threeScene;
  }

  get Camera() {
    return this.camera;
  }

  render(): void {
    this.camera.position.set(0, 0, 0);
  }

  destroy(): void {
    this.threeScene.remove(this.camera);
  }
}

export class SceneRenderer implements Renderer {
  protected scene: Scene;

  threeScene: THREE.Scene;

  protected cameraRenderer: CameraRenderer;

  protected webGLRenderer: THREE.WebGLRenderer;

  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.webGLRenderer = new THREE.WebGLRenderer({ canvas });
    this.threeScene = new THREE.Scene();
    this.cameraRenderer = new CameraRenderer(
      canvas.width / canvas.height,
      this.threeScene
    );
    this.scene = scene;
  }

  render(): void {
    this.webGLRenderer.render(this.threeScene, this.cameraRenderer.Camera);
  }

  destroy(): void {
    this.cameraRenderer.destroy();
    this.webGLRenderer.dispose();
  }
}
