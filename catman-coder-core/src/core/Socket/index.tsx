import { minimatch } from "minimatch";
import {
  MessageMatcher,
  Message,
  MessageBus,
  MessageHandler,
  MessageSubscriber,
  Channel,
  Label,
} from "@/core/entity/Common";

// 一个消息总线,用于处理消息的发布和订阅,和EventBus不同的是,EventBus主要用在前端内部交互,而MessageBus主要用于前后端交互

export class RegexMessageMatcher implements MessageMatcher {
  pattern: string;
  static of(pattern: string): RegexMessageMatcher {
    return new RegexMessageMatcher(pattern);
  }
  constructor(pattern: string) {
    this.pattern = pattern;
  }
  match(message: Message<unknown>): boolean {
    return new RegExp(this.pattern).test(message.topic);
  }
}
export class AllMatcher implements MessageMatcher {
  static of(): AllMatcher {
    return new AllMatcher();
  }
  match(_message: Message<unknown>): boolean {
    return true;
  }
}
export class ReplyToMessageMatcher implements MessageMatcher {
  pattern: string;
  static of(pattern: string): ReplyToMessageMatcher {
    return new ReplyToMessageMatcher(pattern);
  }
  constructor(pattern: string) {
    this.pattern = pattern;
  }
  match(message: Message<unknown>): boolean {
    console.log("message.replyTo", message.replyTo, this.pattern);
    return message.replyTo === this.pattern;
  }
}

export class TopicMessageMatcher implements MessageMatcher {
  pattern: string;
  static of(pattern: string): TopicMessageMatcher {
    return new TopicMessageMatcher(pattern);
  }
  constructor(pattern: string) {
    this.pattern = pattern;
  }
  match(message: Message<unknown>): boolean {
    return message.topic === this.pattern;
  }
}
export class AntMessageMatch implements MessageMatcher {
  pattern: string;
  static of(pattern: string): AntMessageMatch {
    return new AntMessageMatch(pattern);
  }
  constructor(pattern: string) {
    this.pattern = pattern;
  }
  match(message: Message<unknown>): boolean {
    return minimatch(message.topic, this.pattern);
  }
}
export class MessageBuilder<T> {
  message: Message<T>;
  static of<T>(message: Message<T>): MessageBuilder<T> {
    return new MessageBuilder<T>(message);
  }
  constructor(message: Message<T>) {
    this.message = message;
  }
  build(): Message<T> {
    if (this.message.id === undefined) {
      this.message.id = Math.random().toString(36);
    }
    if (this.message.type === undefined) {
      this.message.type = "UNICAST";
    }
    if (this.message.labels === undefined) {
      this.message.labels = {
        items: new Map<string, Label>(),
      };
    }
    if (this.message.labels.items === undefined) {
      this.message.labels.items = new Map<string, Label>();
    }
    if (!this.message.labels.items.has("reply-to")) {
      this.message.labels.items.set("reply-to", {
        name: "reply-to",
        value: [this.message.id],
      });
    }
    return this.message;
  }
}
export class WebSocketChannel implements Channel {
  id: string;
  kind: string;

  messageBus: MessageBus;
  name: string;
  description: string;

  createTime: number;
  creator: string;

  static of(messageBus: MessageBus, id?: string, kind?: string) {
    return new WebSocketChannel(
      id || Math.random().toString(16).slice(2),
      kind || "default",
      "WebSocketChannel",
      "WebSocketChannel",
      messageBus
    );
  }
  constructor(
    id: string,
    kind: string,
    name: string,
    description: string,
    messageBus: MessageBus
  ) {
    this.id = id;
    this.kind = kind;
    this.name = name;
    this.description = description;
    this.createTime = Date.now();
    this.creator = "system";
    this.messageBus = messageBus;
  }

  clear(): void {}

  destroy(): void {}

  publish<T>(message: Message<T>): Channel {
    this.messageBus.publish(this.wrap(message));
    return this;
  }

  wrap<T>(message: Message<T>): Message<T> {
    if (message.channelId === undefined) {
      message.channelId = this.id;
    }
    if (message.channelKind === undefined) {
      message.channelKind = this.kind;
    }
    return message;
  }
  publishAndWait<T>(
    message: Message<T>,
    handler: MessageHandler<unknown>,
    matcher?: MessageMatcher
  ): Channel {
    this.messageBus.publishAndWait(
      this.wrap(message),
      (message) => {
        console.log("message bus receive 2", message);
        if (message.channelId === this.id) {
          handler(message);
        }
      },
      matcher
    );
    return this;
  }

  subscribe(
    matcher: MessageMatcher,
    handler: MessageHandler<unknown>
  ): Channel {
    this.messageBus.subscribe(matcher, (message) => {
      if (message.channelId === this.id) {
        handler(message);
      }
    });
    return this;
  }

  unsubscribe(handler: MessageHandler<unknown>): Channel {
    this.messageBus.unsubscribe(handler);
    return this;
  }
}

export class WebSocketMessageBus implements MessageBus {
  webSocket: WebSocket;
  subscribers: MessageSubscriber<unknown>[];
  constructor(webSocket: WebSocket) {
    this.subscribers = [];
    this.webSocket = webSocket;
    this.updateWebSocket(webSocket);
  }

  getNewChannel(): Channel {
    return WebSocketChannel.of(this);
  }
  getOrCreateChannel(kind?: string, channelId?: string): Channel {
    return WebSocketChannel.of(this, channelId, kind);
  }
  updateWebSocket(webSocket: WebSocket) {
    this.webSocket = webSocket;
    this.webSocket.onmessage = (event) => {
      const message = JSON.parse(event.data) as Message<unknown>;
      console.log("message bus receive", message);
      this.subscribers
        .filter((s) => s.matcher.match(message))
        .forEach((s) => {
          if (s.listeningTimes === 0) {
            this.unsubscribe(s.handler);
          } else {
            s.handler(message);
            if (s.listeningTimes-- === 0) {
              this.unsubscribe(s.handler);
            }
          }
        });
    };
  }
  publishAndWait<T>(
    message: Message<T>,
    handler: MessageHandler<unknown>,
    matcher?: MessageMatcher
  ): MessageBus {
    const msg = MessageBuilder.of(message).build();
    this.addSubscriber({
      listeningTimes: 1,
      matcher: matcher || AllMatcher.of(),
      handler: handler,
    });
    this.publish(msg);
    return this;
  }

  publish<T>(message: Message<T>): MessageBus {
    this.webSocket.send(JSON.stringify(message));
    return this;
  }
  subscribe(
    matcher: MessageMatcher,
    handler: MessageHandler<unknown>
  ): MessageBus {
    this.subscribers.push({ listeningTimes: -1, matcher, handler });
    return this;
  }
  addSubscriber(subscriber: MessageSubscriber<unknown>) {
    this.subscribers.push(subscriber);
    return this;
  }
  unsubscribe(handler: MessageHandler<unknown>): MessageBus {
    this.subscribers = this.subscribers.filter((s) => s.handler !== handler);
    return this;
  }
  clear(): void {
    this.subscribers = [];
  }
}
