import * as math from "mathjs";

interface GameObject {
  position: Vector3;

  rotation: Vector3;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export class Player implements GameObject {
  id: number;

  position: Vector3;

  rotation: Vector3;

  constructor(id: number, position: Vector3, rotation: Vector3) {
    this.id = id;
    this.position = position;
    this.rotation = rotation;
  }
}

function rotateVector3(oldVector: Vector3, rotation: Vector3): Vector3 {
  const { x, y, z } = rotation;
  const rotationMatrixX = math.matrix([
    [1, 0, 0],
    [0, math.cos(x), -math.sin(x)],
    [0, math.sin(x), math.cos(x)],
  ]);
  const rotationMatrixY = math.matrix([
    [math.cos(y), 0, math.sin(y)],
    [0, 1, 0],
    [-math.sin(y), 0, math.cos(y)],
  ]);
  const rotationMatrixZ = math.matrix([
    [math.cos(z), -math.sin(z), 0],
    [math.sin(z), math.cos(z), 0],
    [0, 0, 1],
  ]);
  const oldVectorArray = math.matrix([oldVector.x, oldVector.y, oldVector.z]);
  const newVectorArray = math
    .chain(rotationMatrixX)
    .multiply(rotationMatrixY)
    .multiply(rotationMatrixZ)
    .multiply(oldVectorArray)
    .done();
  return {
    x: newVectorArray.get([0]) as number,
    y: newVectorArray.get([1]) as number,
    z: newVectorArray.get([2]) as number,
  };
}

interface PlayerAction {
  player: Player;

  isCompleted: boolean;

  run(): void;
}

class MoveAction implements PlayerAction {
  player: Player;

  isCompleted = false;

  vector: Vector3;

  constructor(player: Player, vector: Vector3) {
    this.player = player;
    this.vector = vector;
  }

  run() {
    this.player.position.x += this.vector.x;
    this.player.position.y += this.vector.y;
    this.player.position.z += this.vector.z;
    this.isCompleted = true;
  }
}

class RotateAction implements PlayerAction {
  player: Player;

  isCompleted = false;

  rotation: Vector3;

  constructor(player: Player, rotation: Vector3) {
    this.player = player;
    this.rotation = rotation;
  }

  run() {
    this.player.rotation.x += this.rotation.x;
    this.player.rotation.y += this.rotation.y;
    this.player.rotation.z += this.rotation.z;
    this.isCompleted = true;
  }
}

export default class Game {
  players: Player[] = [];

  playerActions: Set<PlayerAction> = new Set();

  userInputs: Map<Player, Record<string, boolean>> = new Map();

  getPlayer(id: number) {
    return this.players.find((player) => player.id === id);
  }

  setPlayer(player: Player) {
    this.players.push(player);
  }

  removePlayer(id: number) {
    const removedPlayer = this.players.find((player) => player.id === id);
    if (!removedPlayer) throw new Error();
    this.players.splice(this.players.indexOf(removedPlayer), 1);
  }

  setUserInputs(playerId: number, inputs: Record<string, boolean>) {
    const player = this.getPlayer(playerId);
    if (!player) throw new Error();
    this.userInputs.set(player, inputs);
  }

  createPlayerActions() {
    for (const [actor, inputs] of this.userInputs) {
      if (inputs.w) {
        this.addPlayerAction(
          new MoveAction(
            actor,
            rotateVector3({ x: 0, y: 0.01, z: 0 }, actor.rotation)
          )
        );
      }
      if (inputs.s) {
        this.addPlayerAction(
          new MoveAction(
            actor,
            rotateVector3({ x: 0, y: -0.01, z: 0 }, actor.rotation)
          )
        );
      }
      if (inputs.a) {
        this.addPlayerAction(new RotateAction(actor, { x: 0, y: 0, z: 0.01 }));
      }
      if (inputs.d) {
        this.addPlayerAction(new RotateAction(actor, { x: 0, y: 0, z: 0.01 }));
      }
    }
  }

  addPlayerAction(playerAction: PlayerAction) {
    this.playerActions.add(playerAction);
  }

  removePlayerAction(playerAction: PlayerAction) {
    this.playerActions.delete(playerAction);
  }

  runPlayerActions() {
    for (const playerAction of this.playerActions) {
      if (playerAction.isCompleted) {
        this.removePlayerAction(playerAction);
      } else {
        playerAction.run();
      }
    }
  }
}
