import { Scene, SceneRenderer, SceneType } from "./commons/models";
import { MainSceneRenderer, MainScene } from "./scenes/Main";
import { LoginSceneRenderer, LoginScene } from "./scenes/Login";
import InputManager from "./InputManger";
import {
  NetworkManager,
  MainSceneNetworkManager,
  LobbySceneNetworkManager,
  BulletStatus,
  ObstacleStatus,
  PlayerStatus,
} from "./NetworkManger";
import { LobbyScene, LobbySceneRenderer } from "./scenes/Lobby";

export default class GameManager {
  userId: number;

  canvas: HTMLCanvasElement;

  display: HTMLDivElement;

  private scene: Scene;

  private sceneRenderer: SceneRenderer;

  private inputManager: InputManager;

  private networkManager: NetworkManager;

  constructor(canvas: HTMLCanvasElement, display: HTMLDivElement) {
    this.userId = Math.random();
    this.canvas = canvas;
    this.display = display;
    this.scene = new LoginScene(() => {
      this.switchScene("lobby");
    });
    this.sceneRenderer = new LoginSceneRenderer(
      this.scene as LoginScene,
      canvas
    );
    this.inputManager = new InputManager();
    this.networkManager = new MainSceneNetworkManager(this.userId);
    this.switchScene("lobby");
  }

  switchScene(sceneType: SceneType) {
    this.sceneRenderer.destroy();
    this.inputManager.destroy();
    this.networkManager.destroy();
    switch (sceneType) {
      case "main": {
        const newMainScene = new MainScene(this.userId, () => {
          this.switchScene("lobby");
        });
        const newMainSceneRenderer = new MainSceneRenderer(
          newMainScene,
          this.canvas
        );
        this.scene = newMainScene;
        this.sceneRenderer = newMainSceneRenderer;
        const newNetworkManager = new MainSceneNetworkManager(
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
        this.networkManager = newNetworkManager;
        this.inputManager = new InputManager((inputs: Map<string, boolean>) => {
          newNetworkManager.sendUserKeyboardInputs(inputs);
        });
        newNetworkManager.sendCreatePlayer();
        break;
      }
      case "login":
        this.scene = new LoginScene(() => {
          this.switchScene("lobby");
        });
        this.sceneRenderer = new LoginSceneRenderer(
          this.scene as LoginScene,
          this.canvas
        );
        break;
      case "lobby": {
        this.scene = new LobbyScene(() => {
          this.switchScene("main");
        });
        const newNetworkManager = new LobbySceneNetworkManager();
        this.networkManager = newNetworkManager;
        this.sceneRenderer = new LobbySceneRenderer(
          this.scene as LobbyScene,
          this.canvas,
          this.display,
          () => {
            newNetworkManager.sendCreateRoom();
          }
        );
        break;
      }
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
