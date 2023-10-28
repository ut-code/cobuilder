import { rotateVector3 } from "shared";
import { PlayerAction } from "./playerAction";
import { Bullet, PLAYER_DEPTH } from "../model";
import Soldier from "../fighters/soldier";

export default class ShootAction implements PlayerAction {
  actor: Soldier;

  isCompleted = false;

  bullets: Bullet[];

  constructor(player: Soldier, bullets: Bullet[]) {
    this.actor = player;
    this.bullets = bullets;
  }

  tick(): void {
    if (!this.actor.isCoolingDown) {
      const { x, y, z } = this.actor.position;
      const vector = rotateVector3(
        { x: 0, y: PLAYER_DEPTH + 10, z: 0 },
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
