import { Core } from "@/core/typings";

/**
 * 值提取器
 * - 支持新建值提取器资源
 * - 当前支持构建http值提取器
 *
 * 需要进行的工作:
 * - 为右键菜单添加新建值提取器资源的选项
 * - 为值提取器资源添加专属的右键菜单
 * - 注册值提取器资源的渲染器
 */
export class ValueProviderProcessor implements Processor {
  before(context: ApplicationContext) {}
}
