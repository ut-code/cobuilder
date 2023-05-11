import * as THREE from "three";
import { Renderer, Scene, SceneType } from "./models";

export class LoginScene extends Scene {
  constructor(onSceneDestroyed: (sceneType: SceneType) => void) {
    super();
    this.onSceneDestroyed = onSceneDestroyed;
  }
}

class CameraRenderer implements Renderer {
  private camera: THREE.PerspectiveCamera;

  threeScene: THREE.Scene;

  constructor(aspect: number, threeScene: THREE.Scene) {
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.threeScene = threeScene;
  }

  getCamera() {
    return this.camera;
  }

  render(): void {
    this.camera.position.set(0, 10, 0);
  }

  destroy(): void {
    this.threeScene.remove(this.camera);
  }
}

export class LoginSceneRenderer implements Renderer {
  scene: LoginScene;

  threeScene: THREE.Scene;

  cameraRenderer: CameraRenderer;

  webGLRenderer: THREE.WebGLRenderer;

  rayCaster: THREE.Raycaster;

  pointer: THREE.Vector2;

  startButton: THREE.Mesh;

  constructor(scene: LoginScene, canvas: HTMLCanvasElement) {
    this.webGLRenderer = new THREE.WebGLRenderer({ canvas });
    this.threeScene = new THREE.Scene();
    this.cameraRenderer = new CameraRenderer(
      canvas.width / canvas.height,
      this.threeScene
    );
    this.scene = scene;
    this.rayCaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.rayCaster.setFromCamera(this.pointer, this.cameraRenderer.getCamera());
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.startButton = new THREE.Mesh(geometry, material);
    this.threeScene.add(this.startButton);
  }

  setPointer(x: number, y: number) {
    this.pointer.set(x, y);
  }

  handleStartButtonClick() {
    const intersects = this.rayCaster.intersectObjects<
      THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>
    >([this.startButton]);
    for (const intersect of intersects) {
      intersect.object.material.color.set(0x00ff00);
    }
  }

  render(): void {
    this.cameraRenderer.render();
    this.webGLRenderer.render(this.threeScene, this.cameraRenderer.getCamera());
  }

  destroy(): void {
    this.cameraRenderer.destroy();
    this.webGLRenderer.dispose();
  }
}
