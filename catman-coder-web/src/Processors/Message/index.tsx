import {
  Processor,
  IApplicationContext as ApplicationContext,
  WebSocketMessageBus,
} from "catman-coder-core";

export class MessageProcessor implements Processor {
  before(context: ApplicationContext) {
    // 将http地址转换为ws地址
    const wsUrl = context.config.backendUrl.replace("http", "ws") + "/ws";

    function createWebSocket() {
      const ws = new WebSocket(wsUrl);
      ws.addEventListener("close", (event) => {
        console.log(
          `WebSocket closed with code: ${event.code}. Reconnecting...`,
        );
        // 重连延时（可根据需要调整）
        setTimeout(() => {
          connection();
        }, 1000);
      });
      return ws;
    }

    function connection() {
      const ws = createWebSocket();
      messageBus.updateWebSocket(ws);
    }

    const messageBus = new WebSocketMessageBus(createWebSocket());
    context.setMessageBus(messageBus);
  }
}
