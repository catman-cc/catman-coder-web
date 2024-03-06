export interface FunctionEditorContext {
  root: string;
  loopContext: LoopReferenceContext;
}

export class DefaultFunctionEditorContext implements FunctionEditorContext {
  root: string = "";
  loopContext: LoopReferenceContext = {};

  /**
   * 添加一个函数信息,
   * @param info
   */
  addFunctionCallInfo(info: FunctionCallInfo) {}
}
