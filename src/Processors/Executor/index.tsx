import { ExecutorJoinCodeDashBoard } from "@/components/Executor/JoinCode/Dashboard";
import { ExecutorJoinCodeEditor } from "@/components/Executor/JoinCode/Editor";
import { ExecutorJoinCodeManager } from "@/components/Executor/JoinCode/manager";
import { ExecutorJoinCode } from "@/services/JoinCode/typeings";

export class ExecutorProcessor implements Core.Processor {
    before(context: Core.ApplicationContext): void {
        this.registryLeftNode(context)
    }

    registryLeftNode(context: Core.ApplicationContext): void {
        context.resourceContext?.register("ExecutorJoinCodeManager", {
            componentCreator():
                | Core.ComponentCreatorFunction
                | Core.ComponentCreator {
                return () => {
                    return <ExecutorJoinCodeManager />;
                };
            },
        });
        context.resourceContext?.register("ExecutorJoinCodeDashBoard", {
            componentCreator() {
                return () => <ExecutorJoinCodeDashBoard />
            },
        })

        context.resourceContext?.register("ExecutorJoinCodeEditor", {
            componentCreator() {
                return (node: Core.LayoutNode<ExecutorJoinCode>) => {
                    const joinCode: ExecutorJoinCode = node.data || {} as ExecutorJoinCode
                    return < ExecutorJoinCodeEditor data={joinCode} />
                }
            },
        })

        const modelConfig = context.layoutContext!.modelConfig!;
        // model.getBorderSet().getBorders().filter(b=>b.getLocation()==="left").forEach(b=>{
        //     // 注册一个节点服务
        //     b.getChildren().push({id:"core-node",type:"tab",name:"节点服务",component:"node-service"} as unknown as Node)
        // })
        // 获取配置文件中的左侧面板,并将节点服务添加到面板中
        const left = modelConfig.borders.find((b) => b.location === "left")!;
        left.children.push({
            type: "tab",
            id: "ExecutorJoinCodeManager",
            name: "执行器注册码管理",
            component: "ExecutorJoinCodeManager",
            floating: true,
            enableFloat: true,
            enableDrag: true,
            helpText: "执行器管理",
            enableClose: false,
            className: "TypeDefinitionMenuIcon",
            icon: "icon-diannao2",
        });
    }
}