import { Core, Resource } from "@/core/typings";
import { Constants } from "@/core/common";
import React from "react";
import { Input, InputRef, Modal, Space } from "antd";
import { ItemParams } from "react-contexify";
import IconCN from "@/components/Icon";

interface ResourceCreationModalProps {
  context: Core.ApplicationContext;
  onOk: (info: { name: string }) => void;
}

interface ResourceCreationModalState {
  open: boolean;
  type: string;
}
class ResourceCreationModal extends React.Component<
  ResourceCreationModalProps,
  ResourceCreationModalState
> {
  nameInput: InputRef | undefined;
  constructor(
    props: Readonly<ResourceCreationModalProps> | ResourceCreationModalState,
  ) {
    super(props);
    this.state = {
      open: true,
      type: "string",
    };
  }

  componentDidMount() {
    this.nameInput?.focus();
  }
  render() {
    return (
      <Modal
        rootClassName={"resource-model"}
        style={{
          maxWidth: 300,
        }}
        title={"新建Parameter"}
        footer={<></>}
        open={this.state.open}
        maskClosable={true}
        onCancel={() => {
          this.setState({ open: false });
        }}
        closable={false}
        destroyOnClose
        afterClose={() => {
          this.props.context.resourceContext?.closeModel();
        }}
      >
        <Space>
          <Input
            ref={(input) => {
              this.nameInput = input;
            }}
            defaultChecked
            autoFocus
            onPressEnter={(e) => {
              this.setState({ open: false });
              this.props.onOk({
                name: e.target.value,
              });
            }}
          ></Input>
        </Space>
      </Modal>
    );
  }
}

export class ParameterProcessor implements Core.Processor {
  before(context: Core.ApplicationContext) {
    function createModel(group: Resource) {
      return (
        <ResourceCreationModal
          context={context}
          onOk={(info) => {
            context.resourceContext?.service
              ?.create({
                parentId: group.id,
                kind: "parameter",
                name: info.name,
                config: {},
              } as unknown as Core.Resource)
              .then((res) => {
                const resourceDetails = res.data;
                // 处理资源
                context.events?.publish({
                  id: "resource-flush",
                  name: "resource-flush",
                  data: resourceDetails,
                });
              });
          }}
        />
      );
    }
    const menuContext = context.resourceContext?.explorer?.menuContext;
    menuContext.menus().children!.push(
      ...([
        {
          id: "snapshot-create",
          type: "item",
          label: "由...此创建Parameter",
          filter: (item: Core.Resource): boolean => {
            return item.kind === Constants.Resource.kind.typeDefinition;
          },
          onMenuClick: (
            menu: Core.Menu<Resource>,
            resource: Core.Resource,
            itemParams: ItemParams,
          ) => {
            let group = resource;
            while (group.kind !== "resource") {
              group =
                context.resourceContext?.store?.resources[resource.parentId];
            }
            // 弹出一个交互窗口,可以从现有资源选择,也可以直接输入名称
            // 直接通过前端或者调用后端生成一个类型定义都可以,此处选择调用后端接口创建资源
            context.resourceContext?.showModel(createModel(group));
          },
        } as unknown as Core.Menu<Core.Resource>,
      ] as unknown as Core.Menu<Core.Resource>[]),
    );
    menuContext?.deep((m) => {
      if (m.id === Constants.Resource.explorer.menu.ids.create) {
        m?.children?.push(
          ...([
            {
              id: "new-type-definition",
              type: "item",
              label: (
                <div className={"flex justify-between content-between"}>
                  <div style={{ marginRight: "5px" }}>
                    <IconCN type={"icon-model-training"} />
                  </div>
                  <div>新建Parameter</div>
                </div>
              ),
              onMenuClick: (
                menu: Core.Menu<Resource>,
                resource: Core.Resource,
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
              },
            },
          ] as unknown as Core.Menu<Core.Resource>[]),
        );
        return false;
      }
      return true;
    });
  }
}
