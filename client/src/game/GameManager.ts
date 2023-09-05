import { User } from "shared";
import { Scene, SceneRenderer, SceneType } from "./models";
import { MainSceneRenderer, MainScene } from "./scenes/Main";
import { LoginSceneRenderer, LoginScene } from "./scenes/Login";
import InputManager from "./InputManger";
import {
  NetworkManager,
  MainSceneNetworkManager,
  LobbySceneNetworkManager,
  LoginSceneNetworkManager,
} from "./NetworkManger";
import { LobbyScene, LobbySceneRenderer } from "./scenes/Lobby";

export default class GameManager {
  user: User = { id: 0, name: "" };

  canvas: HTMLCanvasElement;

  private scene: Scene;

  private sceneRenderer: SceneRenderer;

  private inputManager: InputManager;

  private networkManager: NetworkManager;

  constructor(canvas: HTMLCanvasElement) {
    this.user.id = Math.random();
    this.user.name = "userName";
    this.canvas = canvas;
    this.scene = new LoginScene(() => {
      this.switchScene("lobby");
    });
    this.sceneRenderer = new LoginSceneRenderer(
      this.scene as LoginScene,
      canvas
    );
    this.inputManager = new InputManager(this.canvas);
    this.networkManager = new LoginSceneNetworkManager(this.user);
    this.switchScene("lobby");
  }

  switchScene(sceneType: SceneType) {
    this.sceneRenderer.destroy();
    this.inputManager.destroy();
    this.networkManager.destroy();
    switch (sceneType) {
      case "main": {
        const newMainScene = new MainScene(this.user.id, () => {
          this.switchScene("lobby");
        });
        this.scene = newMainScene;
        const newNetworkManager = new MainSceneNetworkManager(this.user, () => {
          newMainScene.updateScene(newNetworkManager.gameData);
        });
        this.networkManager = newNetworkManager;
        this.inputManager = new InputManager(this.canvas, () => {
          newNetworkManager.sendUserKeyboardInputs(this.inputManager.keyStates);
        });
        newNetworkManager.sendCreatePlayer();
        this.sceneRenderer = new MainSceneRenderer(newMainScene, this.canvas);
        break;
      }
      case "login": {
        this.scene = new LoginScene(() => {
          this.switchScene("lobby");
        });
        this.sceneRenderer = new LoginSceneRenderer(
          this.scene as LoginScene,
          this.canvas
        );
        break;
      }
      case "lobby": {
        const newLobbyScene = new LobbyScene(() => {
          this.switchScene("main");
        });
        this.scene = newLobbyScene;
        const newNetworkManager = new LobbySceneNetworkManager(
          this.user,
          () => {
            newLobbyScene.updateScene(newNetworkManager.lobbyData);
          }
        );
        this.networkManager = newNetworkManager;
        this.sceneRenderer = new LobbySceneRenderer(
          this.scene as LobbyScene,
          this.canvas,
          () => {
            newNetworkManager.sendCreateRoom();
          }
        );
        this.inputManager = new InputManager(this.canvas, () => {
          newLobbyScene.updatePointerState(this.inputManager.pointerState);
        });
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
    this.inputManager?.processInputs(e);
  }

  destroy() {
    this.sceneRenderer.destroy();
    this.networkManager.destroy();
  }
}
