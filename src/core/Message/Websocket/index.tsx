import {
  MessageConnection,
  Message,
  MessageBus,
  CreateChannelOptions,
  MessageChannel,
  CreateChannelResponse,
  MessageExchange,
} from "@/core/Message/typings";
import { DefaultMessageChannel } from "@/core/Message";
import { MessageChannelTopic } from "@/core/Message/Constants.tsx";

export class WebsocketMessageConnection implements MessageConnection {
  ws: WebSocket;
  constructor(ws: WebSocket) {
    this.ws = ws;
  }

  send<T>(_message: Message<T>): void {
    this.ws.send(JSON.stringify(_message));
  }
  close(): void {}
}

export class WebsocketMessageBus implements MessageBus {
  ws: WebSocket;
  exchange: MessageExchange;

  constructor(ws: WebSocket, exchange: MessageExchange) {
    this.ws = ws;
    this.exchange = exchange;
    // 创建默认通道
    this.init();
  }

  private init(): void {}
  createChannel(
    _opt: CreateChannelOptions,
    callback: (_channel: MessageChannel) => void,
    onError?: (_err: Error) => void,
  ): void {
    // 注册一个监听器,用于后续的channel创建
    this.ws.onmessage = (event) => {
      // 此处需要解析通道数据
      const msg = event.data as Message<CreateChannelResponse>;
      if (msg.payload?.success) {
        const channel = new DefaultMessageChannel(
          msg.channelId!,
          new WebsocketMessageConnection(this.ws),
          this.exchange,
          _opt.kind,
        );
        //  在开始回调之前,移除掉监听器,然后将MessageExchange注册到监听服务
        this.ws.onmessage = (event) => {
          const message = event.data as Message<unknown>;
          // 目前没有额外的解析要求,后面可能需要序列化工具处理
          this.exchange.exchange(message, channel);
        };
        callback(channel);
      } else {
        if (onError) {
          onError(new Error(msg.payload?.reason));
        }
      }
    };
    this.ws.send(
      JSON.stringify({
        topic: MessageChannelTopic.channel.create,
        payload: _opt,
      }),
    );
  }
}
