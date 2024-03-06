import {
  Message,
  MessageChannel,
  MessageConnection,
  MessageExchange,
  MessageExchangeStrategy,
  MessageFilter,
  MessageSubscriber,
  MessageSubscriberFilter,
  MessageSubscriberFilterCreator,
  MessageSubscriberFilterFactory,
  MessageSubscriberManager,
  MessageSubscriberWatcher,
  MessageType,
} from "@/core/Message/typings";
import { MessageChannelTopic } from "@/core/Message/Constants.tsx";
import { ID } from "@/core/id";
import { Labels } from "@/core/entity/Common";

export class DefaultMessage<T> implements Message<T> {
  /**
   * 消息的唯一标识
   */
  id?: string;
  /**
   * 消息的主题
   */
  topic?: string;
  /**
   * 消息的标签数据
   */
  labels?: Labels;
  /**
   * 消息的类型
   */
  type?: MessageType;

  /**
   * 通道ID
   */
  channelId?: string;

  /**
   * 通道类型
   */
  channelKind?: string;

  /**
   * 消息发送者
   */
  sender?: string;

  /**
   * 消息接收者
   */
  receiver?: string;
  /**
   * 消息的消费次数
   */
  count?: number;
  /**
   * 消息的载荷
   */
  payload?: T;

  /**
   * 消息的创建时间
   */
  timestamp?: number;

  /**
   * 消息的消费时间,用于计算消息的消费时长
   */
  consumeTime?: number;

  /**
   *  消息的回传数据,消息的接收方在响应时,该数据被包含在back字段中
   */
  sendBack?: { [x: string]: unknown };
  /**
   *  接收到消息,在应答时,会将sendBack中的数据回传给发送者
   */
  back?: { [x: string]: unknown };

  /**
   * 消息的带外数据,用于存储消息的附加数据,该数据会被序列化处理,或许改名叫headers?
   */
  headers?: { [x: string]: unknown };

  /**
   * 消息的附加属性,这些属性只会在本地流转,不会被序列化
   */
  attributes?: { [x: string]: unknown };

  channel?: MessageChannel;

  constructor() {}
  static of(
    message: Message<unknown>,
    channel?: MessageChannel
  ): DefaultMessage<unknown> {
    // 如果message已经是DefaultMessage,则忽略
    if (message instanceof DefaultMessage) {
      if (channel) {
        if (message.channel) {
          if (message.channel !== channel) {
            message.channel = channel;
          }
        } else {
          message.channel = channel;
        }
      }
      return message;
    }
    const dmsg = Object.assign(new DefaultMessage<unknown>(), message);
    dmsg.channel = channel;
    return dmsg;
  }

  static unWrapper(msg: Message<unknown>): Message<unknown> {
    if (msg instanceof DefaultMessage) {
      return msg.toMessage();
    }
    return msg;
  }

  toMessage(): Message<unknown> {
    const newMsg = Object.assign({}, this);
    if (newMsg["channel"]) {
      delete newMsg["channel"];
    }
    return newMsg;
  }
}

export class SameIDMessageSubscriber implements MessageSubscriber {
  id: string;
  handler: (message: Message<unknown>) => void;
  static of(
    id: string,
    handler: (message: Message<unknown>) => void
  ): SameIDMessageSubscriber {
    return new SameIDMessageSubscriber(id, handler);
  }
  constructor(id: string, handler: (message: Message<unknown>) => void) {
    this.id = id;
    this.handler = handler;
  }
  isMatch(message: Message<unknown>): boolean {
    return message.receiver === this.id;
  }
  onMessage(message: Message<unknown>): void {
    this.handler(message);
  }
}
export class DefaultMessageSubscriberFilterFactory
  implements MessageSubscriberFilterFactory
{
  creators: MessageSubscriberFilterCreator[] = [];
  create(message: Message<unknown>): MessageSubscriberFilter[] {
    return this.creators
      .filter((c) => c.support(message))
      .map((c) => c.create(message));
  }

  register(creator: MessageSubscriberFilterCreator): void {
    this.creators.push(creator);
  }
}
export class DefaultMessageSubscriberManager
  implements MessageSubscriberManager
{
  subscribers: MessageSubscriber[] = [];
  filters: MessageFilter[] = [];
  watchers: MessageSubscriberWatcher[] = [];
  subscriberFilterFactory: MessageSubscriberFilterFactory =
    new DefaultMessageSubscriberFilterFactory();

  list(message: Message<unknown>): MessageSubscriber[] {
    const sfs = this.subscriberFilterFactory.create(message);
    let ss = this.subscribers;
    for (const sf of sfs) {
      ss = sf.filter(ss);
    }
    return ss;
  }
  getSubscriberFilterFactory(): MessageSubscriberFilterFactory {
    return this.subscriberFilterFactory;
  }
  add(subscriber: MessageSubscriber): void {
    this.subscribers.push(subscriber);
  }

  addFilter(filter: MessageFilter): void {
    this.filters.push(filter);
  }

  addWatcher(watcher: MessageSubscriberWatcher): void {
    this.watchers.push(watcher);
  }

  remove(subscriber: MessageSubscriber): void {
    this.subscribers = this.subscribers.filter((s) => s !== subscriber);
  }

  removeFilter(filter: MessageFilter): void {
    this.filters = this.filters.filter((f) => f !== filter);
  }

  removeWatcher(watcher: MessageSubscriberWatcher): void {
    this.watchers = this.watchers.filter((w) => w !== watcher);
  }
}

export class DefaultMessageChannel implements MessageChannel {
  id: string;
  kind?: string;
  connection: MessageConnection;
  exchange: MessageExchange;

  constructor(
    id: string,
    connection: MessageConnection,
    exchange: MessageExchange,
    kind?: string
  ) {
    this.id = id;
    this.kind = kind;
    this.connection = connection;
    this.exchange = exchange;
  }

  close(): void {
    this.connection.close();
  }

  send(message: Message<unknown>): void {
    const msg = DefaultMessage.unWrapper(message);
    msg.channelId = this.id;
    msg.channelKind = this.kind;
    this.connection.send(msg);
  }

  sendAndWatch(
    message: Message<unknown>,
    callback: (_msg: Message<unknown>, _err?: Error | null) => void
  ): void {
    // 注册一个监听器,该监听器监听响应当前message的回复
    // 响应的消息topic必须是qa
    const bid = ID();
    message.sendBack = message.sendBack || {};
    message.sendBack["target"] = bid;
    this.exchange.getSubscriberManager().add({
      isMatch(message: Message<unknown>): boolean {
        return (
          message.topic === MessageChannelTopic.qa &&
          message.back?.target === bid
        );
      },
      onMessage(message: Message<unknown>) {
        callback(message);
      },
    });
    this.connection.send(message);
  }

  sendTopic(topic: string, payload: unknown): void {
    this.send({
      id: ID(),
      topic: topic,
      payload: payload,
    });
  }

  onMessage(message: Message<unknown>): void {
    this.exchange.exchange(message, this);
  }
}

export class DefaultMessageExchange implements MessageExchange {
  subscriberManager: MessageSubscriberManager =
    new DefaultMessageSubscriberManager();
  messageExchangeStrategies: {
    [index: MessageType | string]: MessageExchangeStrategy;
  } = {
    UNICAST: new UnicastMessageExchangeStrategy(this.subscriberManager),
    BROADCAST: new BroadcastMessageExchangeStrategy(this.subscriberManager),
  };
  getSubscriberManager(): MessageSubscriberManager {
    return this.subscriberManager;
  }

  exchange(message: Message<unknown>, channel: MessageChannel): void {
    const msg = DefaultMessage.of(message, channel);
    const type = message.type!;
    const strategy = this.messageExchangeStrategies[type];
    if (strategy) {
      strategy.exchange(msg);
    }
  }
}

export abstract class AbstractMessageExchangeStrategy
  implements MessageExchangeStrategy
{
  subscriberManager: MessageSubscriberManager;

  constructor(subscriberManager: MessageSubscriberManager) {
    this.subscriberManager = subscriberManager;
  }

  exchange(message: Message<unknown>): void {
    this.doExchange(message);
  }
  abstract doExchange(message: Message<unknown>): void;
}

export class BroadcastMessageExchangeStrategy extends AbstractMessageExchangeStrategy {
  doExchange(message: Message<unknown>): void {
    const subscribers = this.subscriberManager
      .list(message)
      .filter((s) => s.isMatch(message));

    for (const subscriber of subscribers) {
      subscriber.onMessage(message);
    }
  }
}

export class UnicastMessageExchangeStrategy extends AbstractMessageExchangeStrategy {
  doExchange(message: Message<unknown>): void {
    const subscribers = this.subscriberManager
      .list(message)
      .filter((s) => s.isMatch(message));
    if (subscribers.length > 0) {
      subscribers[0].onMessage(message);
    }
  }
}
