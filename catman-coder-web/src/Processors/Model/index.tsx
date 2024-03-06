import { Core } from "@/core/typings";

/**
 * 一个用于展示模态框的组件,有些时候在想是否真的需要一个模态框,毕竟我支持悬浮窗口啊
 */
export class ModelProcessor implements Processor {
  run(context: ApplicationContext): void {
    // 注册事件,监听模态框信息
    // 当收到模态框信息时,渲染模态框数据
    // 给一个关闭信号
  }
}
