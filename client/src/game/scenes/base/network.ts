import { User, clientEmitEvent } from "shared";

const { VITE_SERVER_WS_ORIGIN } = import.meta.env;

export default abstract class BaseNetworkManager {
  user: User;

  protected socket: WebSocket;

  constructor(user: User, previousNetworkManager?: BaseNetworkManager) {
    this.user = user;
    if (previousNetworkManager) {
      this.socket = previousNetworkManager.socket;
    } else {
      this.socket = new WebSocket(VITE_SERVER_WS_ORIGIN);
      this.socket.addEventListener("open", () => {
        clientEmitEvent(this.socket, {
          event: "connection",
          userConnecting: this.user,
        });
      });
    }
  }

  checkIsSocketOpen() {
    return this.socket.readyState === WebSocket.OPEN;
  }

  destroy() {
    this.socket.close();
  }
}
