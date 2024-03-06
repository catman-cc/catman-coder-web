import IconCN from "@/components/Icon";
import {
  CreationModal,
  Constants,
  DefaultLayoutNode,
  Processor,
  IApplicationContext as ApplicationContext,
  Resource,
  Menu,
} from "catman-coder-core";
import { Popover } from "antd";
import { ItemParams } from "react-contexify";

/**
 * 创建HTTP触发器
 */
export default class HttpTriggerProcessor implements Processor {
  before(context: ApplicationContext): void {
    // 注册菜单
    this.addMenu(context);
    // 创建菜单时
  }
  addMenu(context: ApplicationContext) {
    const layoutContext = context.layoutContext!;
    const menuContext = context.resourceContext?.explorer?.menuContext;
    menuContext!.deep((m) => {
      if (m.id === Constants.Resource.explorer.menu.ids.create) {
        m?.children?.push(
          ...([
            {
              id: "new-http-request",
              type: "item",
              label: (
                <Popover title="示例" placement="right">
                  <div className={"flex justify-between content-between"}>
                    <div style={{ marginRight: "5px" }}>
                      <IconCN type={"icon-HTTP-Response"} />
                    </div>
                    <div>新建HTTP接口定义</div>
                  </div>
                </Popover>
              ),
              onMenuClick: (
                menu: Menu<Resource>,
                resource: Resource,
                itemParams: ItemParams,
              ) => {
                let group = resource;
                while (group.kind !== "resource") {
                  group =
                    context.resourceContext?.store?.resources[
                      resource.parentId
                    ];
                }

                // 弹出一个交互窗口,可以从现有资源选择,也可以直接输入名称
                // 直接通过前端或者调用后端生成一个类型定义都可以,此处选择调用后端接口创建资源
                context.resourceContext?.showModel(
                  <CreationModal
                    context={context}
                    onOk={(info) => {
                      context.resourceContext?.service
                        ?.create({
                          parentId: group.id,
                          kind: "HttpValueProviderQuicker",
                          name: info.name,
                          config: {},
                          previousId:
                            resource.kind === "resource" ? null : resource.id,
                        } as unknown as Resource)
                        .then((res) => {
                          const resourceDetails = res.data;
                          // 处理资源
                          context.events?.publish({
                            id: "resource-flush",
                            name: "resource-flush",
                            data: resourceDetails,
                          });
                          layoutContext.createOrActive(
                            DefaultLayoutNode.ofResource(resourceDetails),
                          );
                        });
                    }}
                  />,
                );
              },
            },
          ] as unknown as Menu<Resource>[]),
        );
        return false;
      }
      return true;
    });
  }
}
