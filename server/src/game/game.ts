import * as math from "mathjs";
import { rotateVector3 } from "./utils/vector3";
import {
  GameObject,
  Player,
  Bullet,
  PLAYER_DEPTH,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  STAGE_WIDTH,
} from "./common/model";
import {
  PlayerAction,
  MoveAction,
  RotateAction,
  JumpAction,
} from "./actions/commonActions";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sensitivity = 3;

const speed = 80;

export default class Game {
  obstacles: GameObject[] = [];

  players: Player[] = [];

  bullets: Bullet[] = [];

  playerActions: Set<PlayerAction> = new Set();

  userInputs: Map<Player, Record<string, boolean>> = new Map();

  getPlayer(id: number) {
    return this.players.find(player => player.id === id);
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
        this.addPlayerAction(new JumpAction(actor));
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

  moveBullets() {
    for (const bullet of this.bullets) {
      bullet.move();
    }
  }

  removeBullet(existingBullet: Bullet) {
    this.bullets.splice(this.bullets.indexOf(existingBullet), 1);
  }

  // 衝突判定
  detectCollision() {
    for (const player of this.players) {
      if (!player.isDead) {
        for (const bullet of this.bullets) {
          if (player !== bullet.owner) {
            const { x, y } = player.position;
            const { x: bulletX, y: bulletY } = bullet.position;
            const distance = math.sqrt((x - bulletX) ** 2 + (y - bulletY) ** 2);
            if (
              distance <
              math.sqrt((PLAYER_DEPTH / 2) ** 2 + (PLAYER_HEIGHT / 2) ** 2)
            ) {
              bullet.owner.score += 10;
              this.removeBullet(bullet);
              player.changeHP(-1);
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

  findEmptySpace() {
    let x = Math.random() * (STAGE_WIDTH / 2 - PLAYER_DEPTH / 2);
    let y = Math.random() * (STAGE_WIDTH / 2 - PLAYER_DEPTH / 2);
    let isSpaceFound = false;
    while (!isSpaceFound) {
      isSpaceFound = true;
      for (const bullet of this.bullets) {
        const { x: bulletX, y: bulletY } = bullet.position;
        const distance = math.sqrt((x - bulletX) ** 2 + (y - bulletY) ** 2);
        if (
          distance <
          math.sqrt((PLAYER_DEPTH / 2) ** 2 + (PLAYER_HEIGHT / 2) ** 2)
        ) {
          isSpaceFound = false;
          x = Math.random() * (STAGE_WIDTH - 50);
          y = Math.random() * (STAGE_WIDTH - 50);
          break;
        }
      }
    }
    return { x, y, z: 5 };
  }
}
