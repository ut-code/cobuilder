import { NetworkManager } from "../../models";

export default class LoginSceneNetworkManager extends NetworkManager {
  sendLogin() {
    this.socket.send(JSON.stringify(this.user));
  }
}
