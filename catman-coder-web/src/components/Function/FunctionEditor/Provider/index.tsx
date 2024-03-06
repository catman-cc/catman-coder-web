import React, { createContext, PropsWithChildren, useContext } from "react";
import { Drawer } from "antd";
import { DrawerProps } from "antd/es/drawer";
export interface FunctionContextProps {
  /**
   * 当前编辑的跟函数的id
   */
  root: string;

  /**
   * 循环引用资源的上下文,可以理解为是一个内存表,用于存储循环引用的资源
   */
  loopContext: LoopReferenceContext;
  drawer?: DrawerProps;
  update: (_ctx: FunctionContextProps) => void;
}

export const FunctionContext = createContext<FunctionContextProps>(null);

export function FunctionRC(
  props: PropsWithChildren<{
    value: FunctionContextProps;
    setValue: React.Dispatch<React.SetStateAction<FunctionContextProps>>;
  }>
) {
  const { value, children } = props;
  value.update = props.setValue;
  return (
    <FunctionContext.Provider value={value}>
      <div style={{ height: "100%", width: "100%" }}>{children}</div>
      {/* 一个抽屉,用于展示函数更详细的信息 */}
      <Drawer {...((value.drawer || {}) as DrawerProps)} placement={"bottom"} />
    </FunctionContext.Provider>
  );
}

/**
 * 获取当前函数的上下文,该上下文包含的是当前函数编辑器中的函数信息,而不是当前正在编辑的函数的信息
 */
export const useFunctionContext = () => {
  return useContext(FunctionContext);
};

export const updateFunctionContext = (
  updater: (_ctx: FunctionContextProps) => void
) => {
  const ctx = useContext(FunctionContext);
};
