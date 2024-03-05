import { Plugin } from "@/common/component/plugin";

export default class TypeDefinitionPlugin implements Plugin.Plugin<Plugin.Context>{
    id: string;
    group: string;
    version: string;
    constructor(id: string, group: string, version: string) {
        this.id = id
        this.group = group
        this.version = version
    }
    run(ctx: Plugin.Context) {
        // 注册布局元素
        ctx.layout().registryComponentCreator(null)
    }

    destory() {

    }
}