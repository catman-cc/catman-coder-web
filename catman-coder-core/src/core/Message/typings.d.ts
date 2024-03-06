export type MessageType =
  | string
  | "BROADCAST"
  | "UNICAST"
  | "MULTICAST"
  | "P2P";
export interface Message<T> {
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
}

/**
 * 消息序列化器,用于消息的序列化和反序列化
 */
export interface MessageSerializer {
  serialize<T>(_message: Message<T>): string;
  deserialize<T>(_message: string): Message<T>;
}

/**
 * 消息序列化工厂,根据序列化类型创建序列化器
 */
export interface MessageSerializerFactory {
  create(_type?: number): MessageSerializer;
}

export interface MessageConnection {
  send<T>(_message: Message<T>): void;
  close(): void;
}

/**
 * 消息通道,用于消息的发送和接收
 */
export interface MessageChannel {
  id: string;
  /**
   * 发送消息
   * @param _message
   */
  send(_message: Message<unknown>): void;

  /**
   * 发送消息
   * @param _topic 消息的主题
   * @param _payload 消息的载荷
   */
  sendTopic(_topic: string, _payload: unknown): void;

  /**
   * 发送消息,并接收回调
   * @param _message 消息
   * @param _callback 回调函数
   */
  sendAndWatch(
    _message: Message<unknown>,
    _callback: (_msg: Message<unknown>, _err?: Error | null) => void
  ): void;

  onMessage(_message: Message<unknown>): void;

  /**
   * 关闭当前通道
   */
  close(): void;
}

export interface MessageChannelManager {
  getChannel(_channelId: string): MessageChannel;
  removeChannel(_channelId: string): void;
}

export interface CreateChannelOptions {
  /**
   * 通道的ID,如果不指定,则由系统自动生成
   */
  channelId?: string;
  /**
   * 通道的名称
   */
  name?: string;
  /**
   * 通道的类型
   */
  kind?: string;
  /**
   * 通道的标签
   */
  labels?: Labels;

  /**
   * 如果通道已经存在,是否覆盖
   */
  overWrite?: boolean;

  /**
   * 通道的属性
   */
  attributes?: { [x: string]: unknown };
}

export interface CreateChannelResponse {
  success: boolean;
  channelId?: string;
  reason?: string;
}

/**
 * 消息订阅者,用于订阅消息
 */
export interface MessageSubscriber {
  /**
   * 是否匹配消息
   * @param _message
   */
  isMatch(_message: Message<unknown>): boolean;

  /**
   * 接收消息
   * @param _message 消息
   */
  onMessage(_message: Message<unknown>): void;
}

export interface MessageFilter {
  filter(_message: Message<unknown>): boolean;
}

export interface MessageSubscriberWatcher {
  afterAdd(_subscriber: MessageSubscriber): void;
  afterRemove(_subscriber: MessageSubscriber): void;
  beforeHandle(
    _message: Message<unknown>,
    _subscriber: MessageSubscriber
  ): void;
  afterHandle(_message: Message<unknown>, _subscriber: MessageSubscriber): void;
}

export interface MessageSubscriberFilter {
  message(): Message<unknown>;
  filter(_subscribers: MessageSubscriber[]): MessageSubscriber[];
}

export interface MessageSubscriberFilterCreator {
  support(_message: Message<unknown>): boolean;
  create(_message: Message<unknown>): MessageSubscriberFilter;
}

export interface MessageSubscriberFilterFactory {
  create(_message: Message<unknown>): MessageSubscriberFilter[];
  register(_creator: MessageSubscriberFilterCreator): void;
}

export interface MessageSubscriberManager {
  list(_message: Message<unknown>): MessageSubscriber[];
  getSubscriberFilterFactory(): MessageSubscriberFilterFactory;
  add(_subscriber: MessageSubscriber): void;
  addWatcher(_watcher: MessageSubscriberWatcher): void;
  addFilter(_filter: MessageFilter): void;

  remove(_subscriber: MessageSubscriber): void;
  removeWatcher(_watcher: MessageSubscriberWatcher): void;
  removeFilter(_filter: MessageFilter): void;
}

export interface MessageExchangeStrategy {
  exchange(_message: Message<unknown>): void;
}

/**
 * 消息交换器,负责完成消息的分发工作
 */
export interface MessageExchange {
  getSubscriberManager(): MessageSubscriberManager;
  exchange(_message: Message<unknown>, _channel: MessageChannel): void;
}
export interface MessageBus {
  createChannel(
    _opt: CreateChannelOptions,
    _callback: (_channel: MessageChannel) => void,
    _err?: (_err: Error) => void
  ): void;
}
