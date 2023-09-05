import * as THREE from "three";
import { LobbyData } from "shared";
import { Scene, SceneRenderer, CameraRenderer } from "../models";
import { PointerState } from "../InputManger";

export class Room {
  id: number;

  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class LobbyScene extends Scene {
  rooms: Room[] = [];

  pointerState: PointerState = { x: 0, y: 0, isPointerDown: false };

  constructor(onSceneDestroyed: () => void) {
    super();
    this.onSceneDestroyed = onSceneDestroyed;
  }

  getRoom(roomId: number) {
    return this.rooms.find((one) => one.id === roomId);
  }

  addRoom(room: Room) {
    this.rooms.push(room);
  }

  removeRoom(roomId: number) {
    const room = this.rooms.find((one) => one.id === roomId);
    if (!room) throw new Error();
    this.rooms.splice(this.rooms.indexOf(room), 1);
  }

  destroy(): void {
    this.onSceneDestroyed?.();
  }

  updateScene(lobbyData: LobbyData) {
    const unusedRooms = new Set(this.rooms);
    for (const roomData of lobbyData.rooms) {
      const existingRoom = this.getRoom(roomData.id);
      if (!existingRoom) {
        this.addRoom(new Room(roomData.id, "new room"));
      } else {
        unusedRooms.delete(existingRoom);
      }
    }
    for (const room of unusedRooms) {
      this.removeRoom(room.id);
    }
  }

  updatePointerState(pointerState: PointerState) {
    this.pointerState.x = pointerState.x;
    this.pointerState.y = pointerState.y;
    this.pointerState.isPointerDown = pointerState.isPointerDown;
  }
}

class LobbySceneCameraRenderer extends CameraRenderer {
  render(): void {
    this.camera.position.set(0, 0, 10);
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

class Button extends UI {
  constructor(threeScene: THREE.Scene) {
    super(threeScene);
    // sprite 作成
    const magnifiedWidth = 4000;
    const magnifiedHeight = 4000;
    const canvasForText = document.createElement("canvas");
    canvasForText.width = magnifiedWidth;
    canvasForText.height = magnifiedHeight;
    const ctx = canvasForText.getContext("2d");
    if (!ctx) throw new Error();
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, magnifiedHeight, magnifiedWidth);
    ctx.fillStyle = "black";
    ctx.font = `${magnifiedWidth / 2}px Arial`;
    const text = "+";
    ctx.fillText(
      text,
      (magnifiedWidth - ctx.measureText(text).width) / 2,
      magnifiedHeight / 2 + ctx.measureText(text).actualBoundingBoxAscent / 2
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

class MatchRow extends UI {
  constructor(threeScene: THREE.Scene) {
    super(threeScene);
    const canvasForText = document.createElement("canvas");
    const ctx = canvasForText.getContext("2d");
    ctx!.fillStyle = "green";
    ctx!.fillRect(0, 0, 10000, 10000);
    const canvasTexture = new THREE.CanvasTexture(canvasForText);
    const spriteMaterial = new THREE.SpriteMaterial({ map: canvasTexture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(3, 1, 1);
    this.sprite = sprite;
    threeScene.add(sprite);
  }

  setPosition(x: number, y: number, z: number) {
    this.sprite.position.set(x, y, z);
  }

  destroy(): void {
    this.threeScene.remove(this.sprite);
  }
}

export class LobbySceneRenderer extends SceneRenderer {
  protected scene: LobbyScene;

  protected cameraRenderer: LobbySceneCameraRenderer;

  private matchRowRenderers: Map<Room, MatchRow> = new Map();

  private raycaster = new THREE.Raycaster();

  private addButton: Button;

  onAddButtonClick: () => void;

  constructor(
    scene: LobbyScene,
    canvas: HTMLCanvasElement,
    onAddButtonClick: () => void
  ) {
    super(scene, canvas);
    this.scene = scene;
    this.onAddButtonClick = onAddButtonClick;
    this.cameraRenderer = new LobbySceneCameraRenderer(
      canvas.width / canvas.height,
      this.threeScene
    );
    if (!this.scene.onSceneDestroyed) throw new Error();
    // + ボタン作成
    const addButton = new Button(this.threeScene);
    this.addButton = addButton;
  }

  private createRow(room: Room) {
    const row = new MatchRow(this.threeScene);
    this.matchRowRenderers.set(room, row);
  }

  render(): void {
    // マッチの行を作成
    const unusedRows = new Set(this.matchRowRenderers.values());
    for (const room of this.scene.rooms) {
      const row = this.matchRowRenderers.get(room);
      if (!row) {
        this.createRow(room);
      } else {
        unusedRows.delete(row);
      }
    }
    for (const row of unusedRows) {
      this.threeScene.remove(row.sprite);
    }
    const rows = Array.from(this.matchRowRenderers.values());
    rows.forEach((row, index) => {
      row.setPosition(5, 6 - index, 0);
    });
    // クリック判定
    const { x, y } = this.scene.pointerState;
    const pointer = new THREE.Vector2(x, y);
    this.raycaster.setFromCamera(pointer, this.cameraRenderer.Camera);
    const intersects = this.raycaster.intersectObject(this.addButton.sprite);
    if (intersects.length > 0) {
      if (this.scene.pointerState.isPointerDown) {
        this.onAddButtonClick();
      }
    }
    this.cameraRenderer.render();
    super.render();
  }

  destroy(): void {
    this.cameraRenderer.destroy();
    this.addButton.destroy();
    for (const renderer of this.matchRowRenderers.values()) {
      renderer.destroy();
    }
    super.destroy();
  }
}
