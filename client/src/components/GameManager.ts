import { Scene, SceneRenderer, SceneType } from "./scenes/models";
import { MainSceneRenderer, MainScene } from "./scenes/Main";
import { LoginSceneRenderer, LoginScene } from "./scenes/Login";
import InputManager from "./InputManger";

export default class GameManager {
  private scene: Scene;

  private sceneRenderer: SceneRenderer;

  private inputManager: InputManager;

  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new MainScene((sceneType: SceneType) => {
      this.switchScene(sceneType);
    });
    this.canvas = canvas;
    this.sceneRenderer = new MainSceneRenderer(this.scene as MainScene, canvas);
    this.inputManager = new InputManager(this.scene);
  }

  switchScene(sceneType: SceneType) {
    this.sceneRenderer.destroy();
    switch (sceneType) {
      case "main":
        this.scene = new MainScene((type: SceneType) => {
          this.switchScene(type);
        });
        this.sceneRenderer = new MainSceneRenderer(
          this.scene as MainScene,
          this.canvas
        );
        break;
      case "login":
        this.scene = new LoginScene((type: SceneType) => {
          this.switchScene(type);
        });
        this.sceneRenderer = new LoginSceneRenderer(
          this.scene as LoginScene,
          this.canvas
        );
        break;
      default:
        throw new Error("scene not found");
    }
  }

  run() {
    let currentTime = Date.now();
    const callBack = () => {
      const previousTime = currentTime;
      currentTime = Date.now();
      this.inputManager.processInput();
      if (this.scene instanceof MainScene) {
        this.scene.runPlayerAction(currentTime - previousTime);
      }
      this.sceneRenderer.render();
      requestAnimationFrame(callBack);
    };
    callBack();
  }

  handleUserInput(e: KeyboardEvent | PointerEvent) {
    if (e instanceof KeyboardEvent) this.inputManager.setKeyStates(e);
    else
      this.inputManager.setPointerCoordinate(
        e,
        this.canvas.width,
        this.canvas.height
      );
  }

  destroy() {
    this.sceneRenderer.destroy();
  }
}
