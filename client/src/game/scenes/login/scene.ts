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
    this.camera.position.set(2, 2, 10);
  }
}

export class LoginButton extends THREE.Sprite {
  constructor(
    texturePath: string,
    scale: THREE.Vector3,
    position: THREE.Vector3
  ) {
    const texture = new THREE.TextureLoader().load(texturePath);
    const material = new THREE.SpriteMaterial({ map: texture });
    super(material);
    this.scale.set(scale.x, scale.y, scale.z);
    this.position.set(position.x, position.y, position.z);
    this.name = "loginButton";
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
    this.loginButton = new LoginButton(
      "../../../resources/login.png",
      new THREE.Vector3(4, 2, 2),
      new THREE.Vector3(1.5, 1.5, 0)
    );
    this.loginButton.name = "loginButton";
    this.threeScene.add(this.loginButton);
  }

  setPointer(x: number, y: number) {
    this.pointer.set(x, y);
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
