import { QuickerCodeEditor } from "@/components/QuickerCodeEditor";

export class QuickerCodeEditorProcessor implements Processor {
  before(context: ApplicationContext) {
    context.resourceContext?.register("QuickerCodeEditor", {
      componentCreator(): ComponentCreatorFunction | ComponentCreator {
        return () => {
          return <QuickerCodeEditor />;
        };
      },
    });
    const modelConfig = context.layoutContext?.modelConfig!;
    // model.getBorderSet().getBorders().filter(b=>b.getLocation()==="left").forEach(b=>{
    //     // 注册一个节点服务
    //     b.getChildren().push({id:"core-node",type:"tab",name:"节点服务",component:"node-service"} as unknown as Node)
    // })
    // 获取配置文件中的左侧面板,并将节点服务添加到面板中
    const left = modelConfig.borders.find((b) => b.location === "bottom")!;
    left.children.push({
      type: "tab",
      id: "QuickerCodeEditor",
      name: "code",
      component: "QuickerCodeEditor",
      floating: true,
      enableFloat: true,
      enableDrag: true,
      helpText: "QuickerCodeEditor",
      enableClose: false,
      className: "TypeDefinitionMenuIcon",
      icon: "icon-code2",
    });
  }
}
