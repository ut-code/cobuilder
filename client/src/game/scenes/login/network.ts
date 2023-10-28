import NetworkManager from "../base/network";

export default class LoginSceneNetworkManager extends NetworkManager {
  sendLogin() {
    this.socket.send(JSON.stringify(this.user));
  }
}
