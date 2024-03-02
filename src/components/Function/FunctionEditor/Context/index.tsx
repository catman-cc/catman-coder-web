export interface FunctionEditorContext {
  root: string;
  loopContext: Core.LoopReferenceContext;
}

export class DefaultFunctionEditorContext implements FunctionEditorContext {
  root: string = "";
  loopContext: Core.LoopReferenceContext = {};

  /**
   * 添加一个函数信息,
   * @param info
   */
  addFunctionCallInfo(info: Core.FunctionCallInfo) {}
}
