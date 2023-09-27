import * as THREE from "three";
import { Scene, SceneRenderer, CameraRenderer } from "../../models";
import { PointerState } from "../../InputManger";

export class SelectScene extends Scene {

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

class SelectSceneCameraRenderer extends CameraRenderer {
  render(): void {
    this.camera.position.set(0, 0, 0.5);
    this.camera.lookAt(0, 0, 0);
  }
}

abstract class UI {
  sprite: THREE.Sprite;

  protected threeScene: THREE.Scene;

  constructor(threeScene: THREE.Scene) {
    this.threeScene = threeScene;
    this.sprite = new THREE.Sprite();
  }
}

class SinglePlayButton extends UI {
  constructor(threeScene: THREE.Scene) {
    super(threeScene);
    // ボタン 作成
    const magnifiedWidth = 4000;
    const magnifiedHeight = 4000;
    const canvasForText = document.createElement("canvas");
    canvasForText.width = magnifiedWidth;
    canvasForText.height = magnifiedHeight;
    const ctx = canvasForText.getContext("2d");
    if (!ctx) throw new Error();
    ctx.fillStyle = "red";
    ctx.fillRect(2000, 0, magnifiedHeight, magnifiedWidth);
    ctx.fillStyle = "white";
    ctx.font = `${magnifiedWidth / 12}px Arial`;
    const text = "Single Play";
    ctx.fillText(
      text,
      (magnifiedWidth - ctx.measureText(text).width) / 2+1000,
      magnifiedHeight / 2 + ctx.measureText(text).actualBoundingBoxAscent / 2+500
    );
    const canvasTexture = new THREE.CanvasTexture(canvasForText);
    const spriteMaterial = new THREE.SpriteMaterial({ map: canvasTexture });
    const sprite = new THREE.Sprite(spriteMaterial);
    this.sprite = sprite;
    threeScene.add(sprite);
  }

  destroy(): void {
    this.threeScene.remove(this.sprite);
  }
}

class MultiPlayButton extends UI {
  constructor(threeScene: THREE.Scene) {
    super(threeScene);
    // ボタン 作成
    const magnifiedWidth = 4000;
    const magnifiedHeight = 4000;
    const canvasForText = document.createElement("canvas");
    canvasForText.width = magnifiedWidth;
    canvasForText.height = magnifiedHeight;
    const ctx = canvasForText.getContext("2d");
    if (!ctx) throw new Error();
    ctx.fillStyle = "green";
    ctx.fillRect(-2000, 0, magnifiedHeight, magnifiedWidth);
    ctx.fillStyle = "white";
    ctx.font = `${magnifiedWidth / 12}px Arial`;
    const text = "Multi Play";
    ctx.fillText(
      text,
      (magnifiedWidth - ctx.measureText(text).width) / 2-1000,
      magnifiedHeight / 2 + ctx.measureText(text).actualBoundingBoxAscent / 2+500
    );
    const canvasTexture = new THREE.CanvasTexture(canvasForText);
    const spriteMaterial = new THREE.SpriteMaterial({ map: canvasTexture });
    const sprite = new THREE.Sprite(spriteMaterial);
    this.sprite = sprite;
    threeScene.add(sprite);
  }

  destroy(): void {
    this.threeScene.remove(this.sprite);
  }
}

export class SelectSceneRenderer extends SceneRenderer {
  protected scene: SelectScene;

  protected cameraRenderer: SelectSceneCameraRenderer;

  private raycaster = new THREE.Raycaster();

  private SinglePlayButton: SinglePlayButton;

  private MultiPlayButton: MultiPlayButton

  onSingleButtonClick: () => void;
  // onMultiButtonClick: () => void;

  constructor(
    scene: SelectScene,
    canvas: HTMLCanvasElement,
    onSingleButtonClick: () => void
    // onMultiButtonClick: () => void;
  ) {
    super(scene, canvas);
    this.scene = scene;
    this.onSingleButtonClick = onSingleButtonClick;
    // this.onMultiButtonClick = onMultiButtonClick;
    this.cameraRenderer = new SelectSceneCameraRenderer(
      canvas.width / canvas.height,
      this.threeScene
    );
    if (!this.scene.onSceneDestroyed) throw new Error();
    //  ボタン作成
    
    this.SinglePlayButton = new SinglePlayButton(this.threeScene);
    this.MultiPlayButton = new MultiPlayButton(this.threeScene);
  }

  render(): void {
    const { x, y } = this.scene.pointerState;
    const pointer = new THREE.Vector2(x, y);
    this.raycaster.setFromCamera(pointer, this.cameraRenderer.Camera);
    const SinglePlayIntersects = this.raycaster.intersectObject(this.SinglePlayButton.sprite);
    if (SinglePlayIntersects.length > 0) {
      if (this.scene.pointerState.isPointerDown) {
        this.onSingleButtonClick();
        console.log("suceess")
      }
    }
    this.cameraRenderer.render();
    super.render();
  }

  destroy(): void {
    this.cameraRenderer.destroy();
    this.SinglePlayButton.destroy();
    super.destroy();
  }
}
