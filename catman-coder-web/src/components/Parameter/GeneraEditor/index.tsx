import "./index.less";

export interface ParameterGeneraEditorProps {
  schema: ParameterSchema;
}

/**
 * 渲染参数定义,和类型定义类似,但不允许进行拖拽操作
 * 在渲染时,依然分为主体部分和子结构
 * 参数定义禁止修改类型定义.
 * 渲染数据:
 *  - 折叠按钮
 *  - 是否是公开类型 -flag icon group
 *  - 名称
 *  - 不可修改的类型定义,鼠标悬浮,允许查看类型定义
 *  - 取值函数
 *  - 默认值函数
 *  - 描述
 *  渲染子数据部分
 * @returns 参数编辑器
 */
export const ParameterGeneraEditor = (props: ParameterGeneraEditorProps) => {
  return (
    <div className="parameter-genera-editor">
      <div className="parameter-genera-editor-main">
        <div>name,不可编辑</div>
        <div>类型</div>
        <div>value</div>
        <div>default-value</div>
      </div>
    </div>
  );
};
