declare namespace Layout {
    // 复用节点数据
    export interface ReuseNode {
        // 固定值,表示该节点是复用节点
        type: "resuse-node"
        // 被复用的节点数据
        node: React.ReactNode | undefined
    }
}