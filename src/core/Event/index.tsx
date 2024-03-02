/**
 * 目前先设计一个最简单的时间机制,后续再完善,现在只需要拥有基本功能就可以
 */

const DEFAULT_GROUP = "default_group";
export class DefaultEventBusContext implements Core.EventBusContext {
  /**
   * 以group作为第一级筛选的事件处理器
   */
  groupListeners: {
    [index: string]: Core.EventListener[];
  };
  constructor() {
    this.groupListeners = {};
  }
  publish(event: Core.Event<unknown>) {
    const group = event.group || DEFAULT_GROUP;
    let listeners = this.groupListeners[group];
    if (!listeners) {
      listeners = this.groupListeners[group] = [];
    }
    listeners
      .filter((l) => l.filterEvent(event))
      .forEach((l) => {
        if (event.stopSpreading) {
          return;
        }
        l.process(event, this);
      });
    return this;
  }
  addListener(listener: Core.EventListener) {
    const group = listener.watchGroup || DEFAULT_GROUP;
    let listeners = this.groupListeners[group];
    if (!listeners) {
      this.groupListeners[group] = listeners = [];
    }
    listeners.push(listener);
    return this;
  }

  subscribe(
    filter: (event: Core.Event<unknown>) => boolean,
    handler: (
      event: Core.Event<unknown>,
      eventBus: Core.EventBusContext,
    ) => void,
  ) {
    this.subscribeGroup(DEFAULT_GROUP, filter, handler);
  }

  subscribeGroup(
    group: string,
    filter: (event: Core.Event<unknown>) => boolean,
    handler: (
      event: Core.Event<unknown>,
      eventBus: Core.EventBusContext,
    ) => void,
  ) {
    const randomStr = new Date().toDateString();
    this.addListener({
      id: randomStr,
      name: randomStr,
      filterEvent(event: Core.Event<unknown>): boolean {
        return filter(event);
      },
      process(
        event: Core.Event<unknown>,
        eventBus: Core.EventBusContext,
      ): void {
        handler(event, eventBus);
      },
      watchGroup: group,
    });
  }
  watchByName(
    name: string,
    handler: (
      event: Core.Event<unknown>,
      eventBus: Core.EventBusContext,
    ) => void,
  ): Core.EventBusContext {
    this.subscribe((event) => {
      return event.name === name;
    }, handler);
    return this;
  }

  watchByIdAndGroup(
    id: string,
    group: string,
    handler: (
      event: Core.Event<unknown>,
      eventBus: Core.EventBusContext,
    ) => void,
  ) {
    this.subscribeGroup(
      group,
      (event) => {
        return event.id === id;
      },
      handler,
    );
  }
}
