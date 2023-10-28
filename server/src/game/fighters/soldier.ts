import { Player } from "../model";

export default class Soldier extends Player {
  isCoolingDown = false;

  coolDownStartTime = Date.now();

  jumpPower = 8;

  isDead = false;

  toggleCoolDown() {
    this.isCoolingDown = !this.isCoolingDown;
  }

  setCoolDownStartTime(time: number) {
    this.coolDownStartTime = time;
  }
}
