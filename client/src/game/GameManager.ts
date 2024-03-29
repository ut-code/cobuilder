import { User } from "shared";
import { SceneType } from "./models";
import BaseNetworkManager from "./scenes/base/network";
import { BaseScene, BaseSceneRenderer } from "./scenes/base";
import { MainSceneRenderer, MainScene } from "./scenes/main";
import { LoginSceneRenderer, LoginScene } from "./scenes/login";
import { LobbyScene, LobbySceneRenderer } from "./scenes/lobby";
import InputManager from "./InputManger";
import MainSceneNetworkManager from "./scenes/main/network";
import LobbySceneNetworkManager from "./scenes/lobby/network";

export default class GameManager {
  user: User = { id: 0, name: "", status: "login" };

  canvas: HTMLCanvasElement;

  private scene!: BaseScene;

  private sceneRenderer!: BaseSceneRenderer;

  private inputManager!: InputManager;

  private networkManager?: BaseNetworkManager;

  constructor(canvas: HTMLCanvasElement) {
    this.user.id = Math.random();
    this.user.name = "userName";
    this.canvas = canvas;
    this.createScene("lobby");
  }

  private createScene(sceneType: SceneType) {
    switch (sceneType) {
      case "main": {
        this.user.status = "game";
        const newMainScene = new MainScene(this.user.id, () => {
          this.switchScene("lobby");
        });
        this.scene = newMainScene;
        const newNetworkManager = new MainSceneNetworkManager(
          this.user,
          () => {
            newMainScene.updateScene(newNetworkManager.gameData);
          },
          this.networkManager
        );
        this.networkManager = newNetworkManager;
        this.inputManager = new InputManager(this.canvas, () => {
          newNetworkManager.sendUserKeyboardInputs(this.inputManager.keyStates);
        });
        this.sceneRenderer = new MainSceneRenderer(newMainScene, this.canvas);
        break;
      }
      case "login": {
        this.user.status = "login";
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
        this.user.status = "lobby";
        const newLobbyScene = new LobbyScene(() => {
          this.switchScene("main");
        });
        this.scene = newLobbyScene;
        const newNetworkManager = new LobbySceneNetworkManager(
          this.user,
          () => {
            newLobbyScene.updateScene(newNetworkManager.lobbyData);
          },
          () => {
            this.switchScene("main");
          },
          this.networkManager
        );
        this.networkManager = newNetworkManager;
        this.sceneRenderer = new LobbySceneRenderer(
          this.scene as LobbyScene,
          this.canvas,
          {
            onAddButtonClick: () => {
              newNetworkManager.sendCreateRoom();
              this.user.status = "waiting";
            },
            onJoinButtonClick: (roomId: number) => {
              newNetworkManager.sendJoinRoom(roomId);
            },
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

  private switchScene(sceneType: SceneType) {
    this.sceneRenderer.destroy();
    this.inputManager.destroy();
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
    this.networkManager?.destroy();
  }
}
