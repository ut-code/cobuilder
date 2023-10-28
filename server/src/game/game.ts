import * as math from "mathjs";
import { rotateVector3 } from "shared";
import {
  GameObject,
  FIGHTER_DEPTH,
  FIGHTER_HEIGHT,
  FIGHTER_WIDTH,
  STAGE_WIDTH,
} from "./model";
import BaseFighter from "./fighters/base";
import Bullet from "./fighters/base/bullet";
import {
  BaseFighterAction,
  MoveAction,
  RotateAction,
  JumpAction,
} from "./fighters/base/action";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sensitivity = 3;

const speed = 80;

export default class Game {
  obstacles: GameObject[] = [];

  fighters: BaseFighter[] = [];

  bullets: Bullet[] = [];

  fighterActions: Set<BaseFighterAction> = new Set();

  userInputs: Map<BaseFighter, Record<string, boolean>> = new Map();

  constructor() {
    this.run();
  }

  getFighter(id: number) {
    return this.fighters.find((fighter) => fighter.id === id);
  }

  setFighter(fighter: BaseFighter) {
    this.fighters.push(fighter);
  }

  removeFighter(fighter: BaseFighter) {
    this.fighters.splice(this.fighters.indexOf(fighter), 1);
  }

  setUserInputs(fighterId: number, inputs: Record<string, boolean>) {
    const fighter = this.getFighter(fighterId);
    if (!fighter) throw new Error();
    this.userInputs.set(fighter, inputs);
  }

  createFighterActions() {
    for (const [actor, inputs] of this.userInputs) {
      actor.setAction("idle");
      if (inputs.w) {
        this.addFighterAction(
          new MoveAction(
            actor,
            rotateVector3({ x: 0, y: 0.001 * speed, z: 0 }, actor.rotation)
          )
        );
      }
      if (inputs.s) {
        this.addFighterAction(
          new MoveAction(
            actor,
            rotateVector3({ x: 0, y: -0.001 * speed, z: 0 }, actor.rotation)
          )
        );
      }
      if (inputs.a) {
        this.addFighterAction(
          new RotateAction(actor, { x: 0, y: 0, z: 0.001 * sensitivity })
        );
      }
      if (inputs.d) {
        this.addFighterAction(
          new RotateAction(actor, { x: 0, y: 0, z: -0.001 * sensitivity })
        );
      }
      if (inputs[" "]) {
        this.addFighterAction(new JumpAction(actor));
      }
    }
  }

  private addFighterAction(fighterAction: BaseFighterAction) {
    this.fighterActions.add(fighterAction);
  }

  removeFighterAction(fighterAction: BaseFighterAction) {
    this.fighterActions.delete(fighterAction);
  }

  runFighterActions(delta: number) {
    for (const fighterAction of this.fighterActions) {
      if (fighterAction.isCompleted) {
        this.removeFighterAction(fighterAction);
      } else {
        fighterAction.tick(delta);
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
    for (const fighter of this.fighters) {
      if (!fighter.isDead) {
        for (const bullet of this.bullets) {
          if (fighter !== bullet.owner) {
            const { x, y } = fighter.position;
            const { x: bulletX, y: bulletY } = bullet.position;
            const distance = math.sqrt((x - bulletX) ** 2 + (y - bulletY) ** 2);
            if (
              distance <
              math.sqrt((FIGHTER_DEPTH / 2) ** 2 + (FIGHTER_HEIGHT / 2) ** 2)
            ) {
              bullet.owner.score += 10;
              this.removeBullet(bullet);
              fighter.changeHP(-1);
            }
          }
        }
        if (fighter.position.x > STAGE_WIDTH / 2 - FIGHTER_WIDTH / 2) {
          fighter.position.x = STAGE_WIDTH / 2 - FIGHTER_WIDTH / 2;
        }
        if (fighter.position.x < -(STAGE_WIDTH / 2 - FIGHTER_WIDTH / 2)) {
          fighter.position.x = -(STAGE_WIDTH / 2 - FIGHTER_WIDTH / 2);
        }
        if (fighter.position.y > STAGE_WIDTH / 2 - FIGHTER_WIDTH / 2) {
          fighter.position.y = STAGE_WIDTH / 2 - FIGHTER_WIDTH / 2;
        }
        if (fighter.position.y < -(STAGE_WIDTH / 2 - FIGHTER_WIDTH / 2)) {
          fighter.position.y = -(STAGE_WIDTH / 2 - FIGHTER_WIDTH / 2);
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

  updateFightersIsDead() {
    for (const fighter of this.fighters) {
      if (fighter.HP <= 0) {
        fighter.isDead = true;
      }
    }
  }

  findEmptySpace() {
    let x = Math.random() * (STAGE_WIDTH / 2 - FIGHTER_DEPTH / 2);
    let y = Math.random() * (STAGE_WIDTH / 2 - FIGHTER_DEPTH / 2);
    let isSpaceFound = false;
    while (!isSpaceFound) {
      isSpaceFound = true;
      for (const bullet of this.bullets) {
        const { x: bulletX, y: bulletY } = bullet.position;
        const distance = math.sqrt((x - bulletX) ** 2 + (y - bulletY) ** 2);
        if (
          distance <
          math.sqrt((FIGHTER_DEPTH / 2) ** 2 + (FIGHTER_HEIGHT / 2) ** 2)
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

  run() {
    let currentTime = Date.now();
    setInterval(() => {
      const previousTime = currentTime;
      currentTime = Date.now();
      this.createFighterActions();
      this.runFighterActions(currentTime - previousTime);
      this.moveBullets();
      this.detectCollision();
      this.updateFightersIsDead();
    }, 10);
  }
}
