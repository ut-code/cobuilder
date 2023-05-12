import * as math from "mathjs";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PLAYER_WIDTH = 10;
const PLAYER_DEPTH = 10;
const PLAYER_HEIGHT = 5;
const STAGE_WIDTH = 800;

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

  HP = 3;

  position: Vector3;

  rotation: Vector3;

  isCoolingDown = false;

  coolDownStartTime = Date.now();

  isDead = false;

  constructor(id: number, position: Vector3, rotation: Vector3) {
    this.id = id;
    this.position = position;
    this.rotation = rotation;
  }

  toggleCoolDown() {
    this.isCoolingDown = !this.isCoolingDown;
  }

  setCoolDownStartTime(time: number) {
    this.coolDownStartTime = time;
  }

  damaged(damage: number) {
    this.HP -= damage;
  }

  preventOffBoard() {
    if (this.position.x > STAGE_WIDTH / 2 - PLAYER_WIDTH / 2) {
      this.position.x = STAGE_WIDTH / 2 - PLAYER_WIDTH / 2;
    }
    if (this.position.x < -(STAGE_WIDTH / 2 - PLAYER_WIDTH / 2)) {
      this.position.x = -(STAGE_WIDTH / 2 - PLAYER_WIDTH / 2);
    }
    if (this.position.y > STAGE_WIDTH / 2 - PLAYER_WIDTH / 2) {
      this.position.y = STAGE_WIDTH / 2 - PLAYER_WIDTH / 2;
    }
    if (this.position.y < -(STAGE_WIDTH / 2 - PLAYER_WIDTH / 2)) {
      this.position.y = -(STAGE_WIDTH / 2 - PLAYER_WIDTH / 2);
    }
  }
}

class Bullet implements GameObject {
  id: number;

  owner: Player;

  position: Vector3;

  rotation: Vector3;

  speed = 1.5;

  constructor(owner: Player, position: Vector3, rotation: Vector3) {
    this.id = Math.random();
    this.owner = owner;
    const { x, y, z } = position;
    const { x: rotationX, y: rotationY, z: rotationZ } = rotation;
    this.position = { x, y, z };
    this.rotation = { x: rotationX, y: rotationY, z: rotationZ };
  }

  move() {
    const vector = rotateVector3({ x: 0, y: this.speed, z: 0 }, this.rotation);
    const { x, y, z } = vector;
    this.position.x += x;
    this.position.y += y;
    this.position.z += z;
  }
}

interface PlayerAction {
  actor: Player;

  isCompleted: boolean;

  tick(delta: number): void;
}

class MoveAction implements PlayerAction {
  actor: Player;

  isCompleted = false;

  vector: Vector3;

  constructor(player: Player, vector: Vector3) {
    this.actor = player;
    this.vector = vector;
  }

  tick(delta: number) {
    this.actor.position.x += this.vector.x * delta;
    this.actor.position.y += this.vector.y * delta;
    this.actor.position.z += this.vector.z * delta;
    this.isCompleted = true;
  }
}

class RotateAction implements PlayerAction {
  actor: Player;

  isCompleted = false;

  rotation: Vector3;

  constructor(player: Player, rotation: Vector3) {
    this.actor = player;
    this.rotation = rotation;
  }

  tick(delta: number) {
    this.actor.rotation.x += this.rotation.x * delta;
    this.actor.rotation.y += this.rotation.y * delta;
    this.actor.rotation.z += this.rotation.z * delta;
    this.isCompleted = true;
  }
}

class ShootAction implements PlayerAction {
  actor: Player;

  isCompleted = false;

  bullets: Bullet[];

  constructor(player: Player, bullets: Bullet[]) {
    this.actor = player;
    this.bullets = bullets;
  }

  tick(): void {
    if (!this.actor.isCoolingDown) {
      const { x, y, z } = this.actor.position;
      const vector = rotateVector3(
        { x: 0, y: PLAYER_DEPTH + 20, z: 0 },
        this.actor.rotation
      );
      const bullet = new Bullet(
        this.actor,
        { x: x + vector.x, y: y + vector.y, z: z + vector.z },
        this.actor.rotation
      );
      this.bullets.push(bullet);
      this.actor.setCoolDownStartTime(Date.now());
      this.actor.toggleCoolDown();
    }
    this.isCompleted = true;
  }
}

const sensitivity = 3;

const speed = 40;

export default class Game {
  players: Player[] = [];

  bullets: Bullet[] = [];

  playerActions: Set<PlayerAction> = new Set();

  userInputs: Map<Player, Record<string, boolean>> = new Map();

  getPlayer(id: number) {
    return this.players.find((player) => player.id === id);
  }

  setPlayer(player: Player) {
    this.players.push(player);
  }

  removePlayer(player: Player) {
    this.players.splice(this.players.indexOf(player), 1);
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
            rotateVector3({ x: 0, y: 0.001 * speed, z: 0 }, actor.rotation)
          )
        );
      }
      if (inputs.s) {
        this.addPlayerAction(
          new MoveAction(
            actor,
            rotateVector3({ x: 0, y: -0.001 * speed, z: 0 }, actor.rotation)
          )
        );
      }
      if (inputs.a) {
        this.addPlayerAction(
          new RotateAction(actor, { x: 0, y: 0, z: 0.001 * sensitivity })
        );
      }
      if (inputs.d) {
        this.addPlayerAction(
          new RotateAction(actor, { x: 0, y: 0, z: -0.001 * sensitivity })
        );
      }
      if (inputs[" "]) {
        this.addPlayerAction(new ShootAction(actor, this.bullets));
      }
    }
  }

  addPlayerAction(playerAction: PlayerAction) {
    this.playerActions.add(playerAction);
  }

  removePlayerAction(playerAction: PlayerAction) {
    this.playerActions.delete(playerAction);
  }

  runPlayerActions(delta: number) {
    for (const playerAction of this.playerActions) {
      if (playerAction.isCompleted) {
        this.removePlayerAction(playerAction);
      } else {
        playerAction.tick(delta);
      }
    }
  }

  manageCoolDown(currentTime: number) {
    for (const player of this.players) {
      if (
        player.isCoolingDown &&
        currentTime - player.coolDownStartTime > 1000
      ) {
        player.toggleCoolDown();
      }
    }
  }

  moveBullets() {
    for (const bullet of this.bullets) {
      bullet.move();
    }
  }

  removeBullet(existingBullet: Bullet) {
    this.bullets.splice(this.bullets.indexOf(existingBullet), 1);
  }

  detectCollision() {
    for (const player of this.players) {
      for (const bullet of this.bullets) {
        if (player !== bullet.owner) {
          const { x, y } = player.position;
          const { x: bulletX, y: bulletY } = bullet.position;
          const distance = math.sqrt((x - bulletX) ** 2 + (y - bulletY) ** 2);
          if (
            distance <
            math.sqrt((PLAYER_DEPTH / 2) ** 2 + (PLAYER_HEIGHT / 2) ** 2)
          ) {
            this.removeBullet(bullet);
            player.damaged(1);
          }
        }
      }
      if (player.position.x > STAGE_WIDTH / 2 - PLAYER_WIDTH / 2) {
        player.position.x = STAGE_WIDTH / 2 - PLAYER_WIDTH / 2;
      }
      if (player.position.x < -(STAGE_WIDTH / 2 - PLAYER_WIDTH / 2)) {
        player.position.x = -(STAGE_WIDTH / 2 - PLAYER_WIDTH / 2);
      }
      if (player.position.y > STAGE_WIDTH / 2 - PLAYER_WIDTH / 2) {
        player.position.y = STAGE_WIDTH / 2 - PLAYER_WIDTH / 2;
      }
      if (player.position.y < -(STAGE_WIDTH / 2 - PLAYER_WIDTH / 2)) {
        player.position.y = -(STAGE_WIDTH / 2 - PLAYER_WIDTH / 2);
      }
    }
    for (const bullet of this.bullets) {
      if (
        bullet.position.x > STAGE_WIDTH / 2 ||
        bullet.position.x < -(STAGE_WIDTH / 2) ||
        bullet.position.y > STAGE_WIDTH / 2 ||
        bullet.position.y < -(STAGE_WIDTH / 2)
      ) {
        this.removeBullet(bullet);
      }
    }
  }

  updatePlayersIsDead() {
    for (const player of this.players) {
      if (player.HP <= 0) {
        player.isDead = true;
      }
    }
  }
}
