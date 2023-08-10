import * as THREE from "three";
import { Scene, SceneRenderer, CameraRenderer } from "../commons/models";
import { RoomData } from "../NetworkManger";
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

  deleteRoom(roomId: number) {
    const room = this.rooms.find((one) => one.id === roomId);
    if (!room) throw new Error();
    this.rooms.splice(this.rooms.indexOf(room), 1);
  }

  destroy(): void {
    this.onSceneDestroyed?.();
  }

  updateRooms(roomsData: RoomData[]) {
    const unusedRooms = new Set(this.rooms);
    for (const roomData of roomsData) {
      const existingRoom = this.getRoom(roomData.id);
      if (!existingRoom) {
        this.addRoom(new Room(roomData.id, "new room"));
      } else {
        unusedRooms.delete(existingRoom);
      }
    }
    for (const room of unusedRooms) {
      this.deleteRoom(room.id);
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

class Button {
  canvas: HTMLCanvasElement;

  sprite: THREE.Sprite;

  threeScene: THREE.Scene;

  constructor(canvas: HTMLCanvasElement, threeScene: THREE.Scene) {
    const magnifiedWidth = 4000;
    const magnifiedHeight = 4000;
    this.canvas = canvas;
    this.threeScene = threeScene;
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

export class LobbySceneRenderer extends SceneRenderer {
  protected scene: LobbyScene;

  protected cameraRenderer: LobbySceneCameraRenderer;

  private matchRowRenderers: Map<Room, THREE.Sprite> = new Map();

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
    const addButton = new Button(canvas, this.threeScene);
    this.addButton = addButton;
  }

  createRow(room: Room) {
    const canvasForText = document.createElement("canvas");
    const ctx = canvasForText.getContext("2d");
    ctx!.fillStyle = "green";
    ctx!.fillRect(0, 0, 15000, 10000);
    const canvasTexture = new THREE.CanvasTexture(canvasForText);
    const spriteMaterial = new THREE.SpriteMaterial({ map: canvasTexture });
    const sprite = new THREE.Sprite(spriteMaterial);
    this.threeScene.add(sprite);
    this.matchRowRenderers.set(room, sprite);
  }

  render(): void {
    // マッチの行を作成
    const unusedRenderers = new Set(this.matchRowRenderers.values());
    for (const room of this.scene.rooms) {
      const renderer = this.matchRowRenderers.get(room);
      if (!renderer) {
        this.createRow(room);
      } else {
        unusedRenderers.delete(renderer);
      }
    }
    for (const renderer of unusedRenderers) {
      this.threeScene.remove(renderer);
    }
    const rows = Array.from(this.matchRowRenderers.values());
    rows.forEach((row, index) => {
      row.position.set(0, 0.5 - index, 0);
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
    super.destroy();
  }
}
