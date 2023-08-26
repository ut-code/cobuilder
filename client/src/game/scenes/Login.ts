import * as THREE from "three";
import { CameraRenderer, Scene, SceneRenderer } from "../commons/models";

export class LoginScene extends Scene {
  constructor(onSceneDestroyed: () => void) {
    super();
    this.onSceneDestroyed = onSceneDestroyed;
  }
}

class LoginSceneCameraRenderer extends CameraRenderer {
  render(): void {
    this.camera.position.set(0, 10, 0);
  }
}

export class LoginSceneRenderer extends SceneRenderer {
  scene: LoginScene;

  cameraRenderer: LoginSceneCameraRenderer;

  rayCaster: THREE.Raycaster;

  pointer: THREE.Vector2;

  startButton: THREE.Mesh;

  constructor(scene: LoginScene, canvas: HTMLCanvasElement) {
    super(scene, canvas);
    this.cameraRenderer = new LoginSceneCameraRenderer(
      canvas.width / canvas.height,
      this.threeScene
    );
    // 背景写真を設定
    const loader = new THREE.TextureLoader();
    const texture = loader.load("../../../resources/clouds1_north.png");
    this.threeScene.background = texture;
    this.scene = scene;
    this.rayCaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.rayCaster.setFromCamera(this.pointer, this.cameraRenderer.Camera);
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
    this.webGLRenderer.render(this.threeScene, this.cameraRenderer.Camera);
  }

  destroy(): void {
    this.cameraRenderer.destroy();
    this.webGLRenderer.dispose();
  }
}
