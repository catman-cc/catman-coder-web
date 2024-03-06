import { createContext, PropsWithChildren, useContext } from "react";

import {
  EventBusContext,
  GlobalConfig,
  LayoutContext,
  MessageBus,
  Processor,
  ResourceContext,
  IApplicationContext,
} from "@/core/entity/Common";

export class DefaultApplicationContext implements IApplicationContext {
  events?: EventBusContext;
  messageBus?: MessageBus;
  layoutContext?: LayoutContext;
  resourceContext?: ResourceContext;
  processors: Processor[];
  config: GlobalConfig = {
    backendUrl: "http://127.0.0.1:8080",
  };
  started: boolean = false;
  constructor() {
    this.processors = [];
  }

  addProcessor(processor: Processor) {
    this.processors.push(processor);
    if (this.started) {
      processor.run && processor.run(this);
    }
  }

  start() {
    // 加载资源
    this.processors.forEach((p) => p.before && p.before(this));
    this.processors.forEach((p) => p.run && p.run(this));
    this.processors.forEach((p) => p.after && p.after!(this));
  }

  setEventBusContext(events: EventBusContext): IApplicationContext {
    this.events = events;
    return this;
  }
  setMessageBus(messageBus: MessageBus): IApplicationContext {
    this.messageBus = messageBus;
    return this;
  }

  setLayoutContext(layoutContext: LayoutContext): IApplicationContext {
    this.layoutContext = layoutContext;
    return this;
  }

  setResourceContext(resourceContext: ResourceContext): IApplicationContext {
    this.resourceContext = resourceContext;
    return this;
  }
}
export const ApplicationContext = createContext<IApplicationContext | null>(
  null
);

export function ApplicationContextRC(
  props: PropsWithChildren<{ value: IApplicationContext }>
) {
  const { value, children } = props;
  return (
    <ApplicationContext.Provider value={value}>
      <div>{children}</div>
    </ApplicationContext.Provider>
  );
}

export function useApplicationContext() {
  return useContext(ApplicationContext)!;
}

export function useEventBus() {
  return useApplicationContext().events;
}

export function useLayoutContext() {
  return useApplicationContext().layoutContext!;
}
