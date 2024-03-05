/**
 * 默认的循环引用上下文,该上下文用于存储循环引用的相关信息
 * 为了简化js端的逻辑,这里的上下文对象可能会存在一些冗余的信息,但是不用担心,后端接收到数据后,会从上下文关联的schema提供的root节点开始解析
 *,从而得到一个干净的上下文对象
 */
export class DefaultLoopReferenceContext implements Core.LoopReferenceContext {
  typeDefinitions: { [index: string]: Core.TypeDefinition };
  valueProviderDefinitions: { [index: string]: unknown };
  parameters: { [index: string]: Core.Parameter };
  functionInfos: { [index: string]: Core.FunctionInfo };
  functionCallInfos: { [index: string]: Core.FunctionCallInfo };
  constructor() {
    this.typeDefinitions = {};
    this.valueProviderDefinitions = {};
    this.parameters = {};
    this.functionInfos = {};
    this.functionCallInfos = {};
  }
  getTypeDefinition(id: string): Core.TypeDefinition {
    return this.typeDefinitions[id];
  }
  getValueProviderDefinition(id: string): unknown {
    return this.valueProviderDefinitions[id];
  }
  getParameter(id: string): Core.Parameter {
    return this.parameters[id];
  }
  getFunctionInfo(id: string): Core.FunctionInfo {
    return this.functionInfos[id];
  }
  getFunctionCallInfo(id: string): Core.FunctionCallInfo {
    return this.functionCallInfos[id];
  }

  updateTypeDefinition(typeDefinition: Core.TypeDefinition, id?: string) {
    const tdId = id || typeDefinition.id;
    if (!tdId) throw new Error("id is required");
    this.typeDefinitions[tdId] = typeDefinition;
  }
  updateParameter(parameter: Core.Parameter, id?: string) {
    const pId = id || parameter.id;
    if (!pId) throw new Error("id is required");
    this.parameters[pId] = parameter;
  }
  updateFunctionInfo(functionInfo: Core.FunctionInfo, id?: string) {
    const fId = id || functionInfo.id;
    if (!fId) throw new Error("id is required");
    this.functionInfos[fId] = functionInfo;
  }
  updateFunctionCallInfo(functionCallInfo: Core.FunctionCallInfo, id?: string) {
    const fcId = id || functionCallInfo.id;
    if (!fcId) throw new Error("id is required");
    this.functionCallInfos[fcId] = functionCallInfo;
  }
}
