import { createContext, PropsWithChildren, useContext } from "react";

export class DefaultApplicationContext implements Core.ApplicationContext {
  events?: Core.EventBusContext;
  messageBus?: Core.MessageBus;
  layoutContext?: Core.LayoutContext;
  resourceContext?: Core.ResourceContext;
  processors: Core.Processor[];
  config: Core.GlobalConfig = {
    backendUrl: "http://127.0.0.1:8080",
  };
  started: boolean = false;
  constructor() {
    this.processors = [];
  }

  addProcessor(processor: Core.Processor) {
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

  setEventBusContext(events: Core.EventBusContext): Core.ApplicationContext {
    this.events = events;
    return this;
  }
  setMessageBus(messageBus: Core.MessageBus): Core.ApplicationContext {
    this.messageBus = messageBus;
    return this;
  }

  setLayoutContext(layoutContext: Core.LayoutContext): Core.ApplicationContext {
    this.layoutContext = layoutContext;
    return this;
  }

  setResourceContext(
    resourceContext: Core.ResourceContext,
  ): Core.ApplicationContext {
    this.resourceContext = resourceContext;
    return this;
  }
}
export const ApplicationContext = createContext<Core.ApplicationContext>(null);

export function ApplicationContextRC(
  props: PropsWithChildren<{ value: Core.ApplicationContext }>,
) {
  const { value, children } = props;
  return (
    <ApplicationContext.Provider value={value}>
      <div>{children}</div>
    </ApplicationContext.Provider>
  );
}

export function useApplicationContext() {
  return useContext(ApplicationContext);
}

export function useEventBus() {
  return useApplicationContext().events;
}

export function useLayoutContext() {
  return useApplicationContext().layoutContext;
}
