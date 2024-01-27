/**
 * 函数定义面板,
 * 主要分为四个部分:
 * - 基本信息
 * - 入参配置,可以有多个,每一个入参配置都有一个属于自己的名称,渲染时,使用一个横向可拖拽改变顺序的面板,支持添加或者删除参数
 *   - 点击添加面板时,可以根据需要获取不同的变量数据,比如,固定变量
 * - 出参配置
 * - 自定义任务流
 */

import { FunctionArgsPanel } from "../ArgsPanel"
import { FunctionResultPanel } from "../ResultPanel"
import "./index.less"
export interface UniversalFunctionEditorProps {
    editable: boolean
}
export const UniversalFunctionEditor = () => {

    return (
        <div className="universal-function-editor">
            <div className="universal-function-editor-basic">
                <div>
                    任务名称,任务类型,任务性质(内置,公开)
                </div>
                <div>
                    任务简短描述
                </div>
                <div>
                    运行环境约束
                </div>
                <div>
                    任务的wiki文档,如果存在
                </div>
            </div>
            <div className="universal-function-editor-args-panel">
                <FunctionArgsPanel />
            </div>

            <div className="universal-function-editor-result-panel">
                任务出参类型定义
                <FunctionResultPanel />
            </div>

            <div className="universal-function-editor-details">
                任务的细节面板,但是内置任务不支持
            </div>
        </div>
    )
}