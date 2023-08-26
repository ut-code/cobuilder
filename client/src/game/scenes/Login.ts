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
    this.camera.position.set(2, 2, 10);
  }
}

export class LoginSceneRenderer extends SceneRenderer {
  scene: LoginScene;

  cameraRenderer: LoginSceneCameraRenderer;

  rayCaster: THREE.Raycaster;

  pointer: THREE.Vector2;

  loginButton: THREE.Sprite;

  canvas: HTMLCanvasElement;

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
    this.canvas = canvas;
    this.rayCaster.setFromCamera(this.pointer, this.cameraRenderer.Camera);
    // ログインボタンを作成
    const createTexture = (filepath: string) => {
      return new THREE.TextureLoader().load(filepath);
    };
    const createSprite = (
      loginTexture: THREE.Texture,
      scale: THREE.Vector3,
      position: THREE.Vector3
    ) => {
      const spriteMaterial = new THREE.SpriteMaterial({
        map: loginTexture,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(scale.x, scale.y, scale.z);
      sprite.position.set(position.x, position.y, position.z);
      return sprite;
    };
    const loginTexture = createTexture("../../../resources/login.png");
    this.loginButton = createSprite(
      loginTexture,
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
    this.cameraRenderer.render();
    this.webGLRenderer.render(this.threeScene, this.cameraRenderer.Camera);
  }

  destroy(): void {
    this.cameraRenderer.destroy();
    this.webGLRenderer.dispose();
  }
}
