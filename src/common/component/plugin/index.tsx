export class Plugin {

}

export interface PluginList {
    [index: string]: Plugin
}

/**
 * 插件管理器
 */
export class PluginManager {
    plugins: PluginList
    constructor() {
        this.plugins = {}
    }
}


/**
 * 插件的核心信息
 */
export class GAV {
    id: string
    group: string
    version: string
    constructor(id: string, group: string, version: string) {
        this.id = id
        this.group = group
        this.version = version
    }
    toString(): string {
        return this.group + "@" + this.id + "@" + this.version
    }

    static parse(desc: string): GAV {
        const info = desc.split("2")
        return new GAV(info[0], info[1], info[2])
    }
}