import * as THREE from "three";
import { CameraRenderer, Scene, SceneRenderer } from "../commons/models";
import { PointerState } from "../InputManger";

export class LoginScene extends Scene {
  pointerState: PointerState = { x: 0, y: 0, isPointerDown: false };

  constructor(onSceneDestroyed: () => void) {
    super();
    this.onSceneDestroyed = onSceneDestroyed;
  }

  destroy(): void {
    this.onSceneDestroyed?.();
  }

  updatePointerState(pointerState: PointerState) {
    this.pointerState.x = pointerState.x;
    this.pointerState.y = pointerState.y;
    this.pointerState.isPointerDown = pointerState.isPointerDown;
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

  loginButton: LoginButton;

  constructor(scene: LoginScene, canvas: HTMLCanvasElement) {
    super(scene, canvas);
    this.cameraRenderer = new LoginSceneCameraRenderer(
      canvas.width / canvas.height,
      this.threeScene
    );
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
    // クリック判定
    const { x, y } = this.scene.pointerState;
    const pointer = new THREE.Vector2(x, y);
    this.rayCaster.setFromCamera(pointer, this.cameraRenderer.Camera);

    const intersects = this.rayCaster.intersectObject(this.loginButton);
    if (intersects.length > 0) {
      if (this.scene.pointerState.isPointerDown) {
        console.log("login");
      }
    }
    this.cameraRenderer.render();
    this.webGLRenderer.render(this.threeScene, this.cameraRenderer.Camera);
  }

  destroy(): void {
    this.cameraRenderer.destroy();
    this.webGLRenderer.dispose();
  }
}
