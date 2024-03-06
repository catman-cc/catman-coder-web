import { createContext, PropsWithChildren, useContext } from "react";
export const ApplicationContext = createContext<ApplicationContext | null>(
  null
);

export function ApplicationContextRC(
  props: PropsWithChildren<{ value: ApplicationContext }>
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
