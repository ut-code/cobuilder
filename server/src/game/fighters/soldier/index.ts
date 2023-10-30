import Fighter from "../base";

export default class Soldier extends Fighter {
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
