/* eslint-disable no-restricted-syntax */
import { MainSceneRenderer, MainScene } from "./scenes/main";

export default class Game {
  private scene: MainScene;

  private sceneRenderer: MainSceneRenderer;

  readonly keyStates: Map<string, boolean>;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new MainScene();
    this.sceneRenderer = new MainSceneRenderer(this.scene, canvas);
    this.keyStates = new Map();
  }

  run() {
    let currentTime = Date.now();
    const callBack = () => {
      const previousTime = currentTime;
      currentTime = Date.now();
      this.scene.executeUserAction(this.keyStates, currentTime - previousTime);
      this.sceneRenderer.render();
      requestAnimationFrame(callBack);
    };
    callBack();
  }

  setKeyStates(e: KeyboardEvent) {
    this.keyStates.set(e.key, e.type === "keydown");
  }

  destroy() {
    this.sceneRenderer.destroy();
  }
}
