import { createContext, PropsWithChildren, useContext } from "react";
import { IApplicationContext } from "catman-coder-core";
export const ApplicationContext = createContext<IApplicationContext | null>(
  null,
);

export function ApplicationContextRC(
  props: PropsWithChildren<{ value: IApplicationContext }>,
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
  return useApplicationContext()?.events;
}

export function useLayoutContext() {
  return useApplicationContext().layoutContext!;
}
