import { User } from "shared";
import { Scene, SceneRenderer, SceneType, NetworkManager } from "./models";
import { MainSceneRenderer, MainScene } from "./scenes/main/scene";
import { LoginSceneRenderer, LoginScene } from "./scenes/login/scene";
import { SelectSceneRenderer, SelectScene } from "./scenes/mode_select/scene";
import { LobbyScene, LobbySceneRenderer } from "./scenes/lobby/scene";
import InputManager from "./InputManger";
import MainSceneNetworkManager from "./scenes/main/network";
import LobbySceneNetworkManager from "./scenes/lobby/network";

export default class GameManager {
  user: User = { id: 0, name: "" };

  canvas: HTMLCanvasElement;

  private scene!: Scene;

  private sceneRenderer!: SceneRenderer;

  private inputManager!: InputManager;

  private networkManager!: NetworkManager;

  constructor(canvas: HTMLCanvasElement) {
    this.user.id = Math.random();
    this.user.name = "userName";
    this.canvas = canvas;
    this.createScene("mode_select");//ここを変える
  }

  private createScene(sceneType: SceneType) {
    switch (sceneType) {
      case "main": {
        const newMainScene = new MainScene(this.user.id, () => {
          this.switchScene("lobby");
        });
        this.scene = newMainScene;
        const newNetworkManager = new MainSceneNetworkManager(
          this.user,
          () => {
            newMainScene.updateScene(newNetworkManager.gameData);
          },
          () => {
            newNetworkManager.sendCreatePlayer();
          }
        );
        this.networkManager = newNetworkManager;
        this.inputManager = new InputManager(this.canvas, () => {
          newNetworkManager.sendUserKeyboardInputs(this.inputManager.keyStates);
        });
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
        this.inputManager = new InputManager(this.canvas, () => {
          (this.scene as LoginScene).updatePointerState(
            this.inputManager.pointerState
          );
        });
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
      case "mode_select": {
        const newSelectScene = new SelectScene(() => {
          this.switchScene("main");
        });
        this.scene = newSelectScene;
        const newNetworkManager = new LobbySceneNetworkManager(
          this.user,
          () => {
            // newSelectScene.updateScene(newNetworkManager.lobbyData);
          }
        );
        this.networkManager = newNetworkManager;
        this.sceneRenderer = new SelectSceneRenderer(
          this.scene as LobbyScene,
          this.canvas,
          () => {
            newNetworkManager.sendCreateRoom();
          }
        );
        this.inputManager = new InputManager(this.canvas, () => {
          newSelectScene.updatePointerState(this.inputManager.pointerState);
        });
        break;
      }
      default:
        throw new Error("scene not found");
    }
  }

  private switchScene(sceneType: SceneType) {
    this.sceneRenderer.destroy();
    this.inputManager.destroy();
    this.networkManager.destroy();
    this.createScene(sceneType);
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
