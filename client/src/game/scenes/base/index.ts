import * as THREE from "three";
import { Renderer } from "../../models";

export abstract class BaseScene {
  onSceneDestroyed?(): void;
}

export class BaseCameraRenderer implements Renderer {
  protected camera: THREE.PerspectiveCamera;

  threeScene: THREE.Scene;

  constructor(aspect: number, threeScene: THREE.Scene) {
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
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

export class BaseSceneRenderer implements Renderer {
  protected scene: BaseScene;

  threeScene: THREE.Scene;

  protected cameraRenderer: BaseCameraRenderer;

  protected webGLRenderer: THREE.WebGLRenderer;

  constructor(scene: BaseScene, canvas: HTMLCanvasElement) {
    this.webGLRenderer = new THREE.WebGLRenderer({ canvas });
    this.threeScene = new THREE.Scene();
    this.cameraRenderer = new BaseCameraRenderer(
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
