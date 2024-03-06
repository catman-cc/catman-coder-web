import events from "events";
import { EventBusContext, Event, EventListener } from "@/core/entity/Common";

export const EventBus = new events.EventEmitter();

export const Events = {
  Layout: {
    ADD_TAB: "ADD_TAB",
    CLOSE_TAB: "CLOSE_TAB",
  },
};

EventBus.on(Events.Layout.ADD_TAB, (_args) => {});
export default EventBus;

/**
 * 目前先设计一个最简单的时间机制,后续再完善,现在只需要拥有基本功能就可以
 */

const DEFAULT_GROUP = "default_group";
export class DefaultEventBusContext implements EventBusContext {
  /**
   * 以group作为第一级筛选的事件处理器
   */
  groupListeners: {
    [index: string]: EventListener[];
  };
  constructor() {
    this.groupListeners = {};
  }
  publish(event: Event<unknown>) {
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
  addListener(listener: EventListener) {
    const group = listener.watchGroup || DEFAULT_GROUP;
    let listeners = this.groupListeners[group];
    if (!listeners) {
      this.groupListeners[group] = listeners = [];
    }
    listeners.push(listener);
    return this;
  }

  subscribe(
    filter: (event: Event<unknown>) => boolean,
    handler: (event: Event<unknown>, eventBus: EventBusContext) => void
  ) {
    this.subscribeGroup(DEFAULT_GROUP, filter, handler);
  }

  subscribeGroup(
    group: string,
    filter: (event: Event<unknown>) => boolean,
    handler: (event: Event<unknown>, eventBus: EventBusContext) => void
  ) {
    const randomStr = new Date().toDateString();
    this.addListener({
      id: randomStr,
      name: randomStr,
      filterEvent(event: Event<unknown>): boolean {
        return filter(event);
      },
      process(event: Event<unknown>, eventBus: EventBusContext): void {
        handler(event, eventBus);
      },
      watchGroup: group,
    });
  }
  watchByName(
    name: string,
    handler: (event: Event<unknown>, eventBus: EventBusContext) => void
  ): EventBusContext {
    this.subscribe((event) => {
      return event.name === name;
    }, handler);
    return this;
  }

  watchByIdAndGroup(
    id: string,
    group: string,
    handler: (event: Event<unknown>, eventBus: EventBusContext) => void
  ) {
    this.subscribeGroup(
      group,
      (event) => {
        return event.id === id;
      },
      handler
    );
  }
}
