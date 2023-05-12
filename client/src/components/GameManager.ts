import { Renderer, Scene, SceneType } from "./scenes/models";
import { MainSceneRenderer, MainScene } from "./scenes/Main";
import { LoginSceneRenderer, LoginScene } from "./scenes/Login";
import InputManager from "./InputManger";
import NetworkManager, {
  BulletStatus,
  ObstacleStatus,
  PlayerStatus,
} from "./NetworkManger";

export default class GameManager {
  userId: number;

  canvas: HTMLCanvasElement;

  private scene: Scene;

  private sceneRenderer: Renderer;

  private inputManager: InputManager;

  private networkManager: NetworkManager;

  constructor(canvas: HTMLCanvasElement) {
    this.userId = Math.random();
    this.canvas = canvas;
    this.scene = new LoginScene((sceneType: SceneType) => {
      this.switchScene(sceneType);
    });
    this.sceneRenderer = new LoginSceneRenderer(
      this.scene as LoginScene,
      canvas
    );
    this.inputManager = new InputManager();
    this.networkManager = new NetworkManager(this.userId);
    this.switchScene("main");
  }

  switchScene(sceneType: SceneType) {
    this.sceneRenderer.destroy();
    this.networkManager.destroy();
    switch (sceneType) {
      case "main": {
        const newMainScene = new MainScene(this.userId, (type: SceneType) => {
          this.switchScene(type);
        });
        const newMainSceneRenderer = new MainSceneRenderer(
          newMainScene,
          this.canvas
        );
        this.scene = newMainScene;
        this.sceneRenderer = newMainSceneRenderer;
        this.networkManager = new NetworkManager(
          this.userId,
          (
            playerStatuses: PlayerStatus[],
            bulletStatuses: BulletStatus[],
            obstacleStatuses: ObstacleStatus[]
          ) => {
            newMainScene.updateGameObjects(
              playerStatuses,
              bulletStatuses,
              obstacleStatuses
            );
          }
        );
        this.networkManager.sendCreatePlayer();
        this.inputManager.onInputs = (inputs: Map<string, boolean>) => {
          this.networkManager.sendUserKeyboardInputs(inputs);
        };

        break;
      }
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
    const callBack = () => {
      this.sceneRenderer.render();
      requestAnimationFrame(callBack);
    };
    callBack();
  }

  handleUserInput(e: KeyboardEvent | PointerEvent) {
    if (this.scene instanceof MainScene) {
      if (e instanceof KeyboardEvent)
        this.inputManager?.processKeyboardInputs(e);
      else
        this.inputManager?.processPointerInputs(
          e,
          this.canvas.width,
          this.canvas.height
        );
    }
  }

  destroy() {
    this.sceneRenderer.destroy();
    this.networkManager.destroy();
  }
}
