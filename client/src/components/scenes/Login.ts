import * as THREE from "three";
import { Scene, SceneRenderer, SceneType } from "./models";

export class LoginScene extends Scene {
  constructor(onSceneDestroyed: (sceneType: SceneType) => void) {
    super();
    this.onSceneDestroyed = onSceneDestroyed;
  }
}

export class LoginSceneRenderer extends SceneRenderer {
  scene: LoginScene;

  rayCaster: THREE.Raycaster;

  pointer: THREE.Vector2;

  startButton: THREE.Mesh;

  constructor(scene: LoginScene, canvas: HTMLCanvasElement) {
    super(canvas);
    this.camera.position.set(0, 0, 5);
    this.scene = scene;
    this.rayCaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.rayCaster.setFromCamera(this.pointer, this.camera);
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
}
