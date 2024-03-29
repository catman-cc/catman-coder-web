import IconCN from "@/components/Icon";
import { PeekTypeIcon } from "@/components/TypeDefinition/common.tsx";
import { TypeDefinitionSchemaEditor } from "@/components/TypeDefinitionEditor";
import {
  DefaultLayoutNode,
  Constants,
  Resource,
  IApplicationContext as ApplicationContext,
  Processor,
  ResourceViewer,
  ResourceViewerFunction,
  LayoutContext,
  ResourceDetails,
  ComponentCreatorFunction,
  ComponentCreator,
  LayoutNode,
  Menu,
} from "catman-coder-core";
import { Input, InputRef, Modal, Select, Space } from "antd";
import React from "react";
import { ItemParams } from "react-contexify";
function getMenuItem(name: string, label: string) {
  return {
    key: name,
    text: label,
    icon: PeekTypeIcon(name),
    label: PeekTypeIcon(name),
    value: name,
  };
}
interface TypeDefinitionCreationModalProps {
  context: ApplicationContext;
  onOk: (info: { name: string; type: string }) => void;
}

interface TypeDefinitionCreationModalState {
  open: boolean;
  type: string;
}

class TypeDefinitionCreationModal extends React.Component<
  TypeDefinitionCreationModalProps,
  TypeDefinitionCreationModalState
> {
  nameInput: InputRef | undefined;
  constructor(
    props:
      | Readonly<TypeDefinitionCreationModalProps>
      | TypeDefinitionCreationModalProps,
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
        title={"新建类型定义"}
        footer={<></>}
        centered
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
        <div className={"body-wrapper"}>
          <Select
            defaultValue="string"
            style={{ width: 30 }}
            onChange={(value) => {
              this.setState({
                ...this.state,
                type: value,
              });
            }}
            popupMatchSelectWidth={false}
            optionRender={(option) => {
              return (
                <Space>
                  {option.data.icon}
                  {option.data.text}
                </Space>
              );
            }}
            options={[
              {
                label: "基础数据类型",
                type: "group",
                options: [
                  getMenuItem("string", "字符串"),
                  getMenuItem("number", "数值"),
                  getMenuItem("boolean", "布尔"),
                ],
              },
              {
                key: "complex",
                label: "复合数据类型",
                type: "group",
                options: [
                  getMenuItem("array", "集合"),
                  getMenuItem("map", "对象"),
                  getMenuItem("struct", "自定义对象"),
                ],
              },
              {
                key: "advanced",
                label: "高级数据类型",
                type: "group",
                options: [
                  getMenuItem("refer", "引用"),
                  getMenuItem("slot", "扩展点"),
                ],
              },
            ]}
          />

          <Input
            ref={(input) => {
              this.nameInput = input;
            }}
            style={{ width: "100%" }}
            onPressEnter={(e) => {
              this.setState({ open: false });
              this.props.onOk({
                name: e.target.value,
                type: this.state.type,
              });
            }}
          ></Input>
        </div>
      </Modal>
    );
  }
}

export default class TypeDefinitionProcessor implements Processor {
  after(): void {}

  run(): void {}
  register(context: ApplicationContext) {
    context.resourceContext?.register("td", {
      resourceViewer(): ResourceViewer | ResourceViewerFunction {
        return (
          resource: Resource,
          _: ApplicationContext,
          layout: LayoutContext,
        ) => {
          const resourceDetails =
            resource as unknown as ResourceDetails<unknown>;
          const layoutNode = DefaultLayoutNode.ofResource(resourceDetails);
          layoutNode.componentName = "td";
          layoutNode.icon = "icon-moxing";
          // 调用上下文展示资源
          layoutNode.settings.tab = {
            id: resourceDetails.id,
            name: resourceDetails.name,
            component: "td",
            enableFloat: true,
          };
          layoutNode.config = {
            schema: resourceDetails,
          };
          layout.createOrActive(layoutNode, "tab");
        };
      },
      componentCreator(): ComponentCreatorFunction | ComponentCreator {
        return (node: LayoutNode<Resource>) => {
          return (
            <TypeDefinitionSchemaEditor
              schema={node.data.details}
              updateSchema={(s) => {
                // context.resourceContext?.service?.save({
                //
                // })
              }}
            />
          );
        };
      },
    });
  }
  before(context: ApplicationContext) {
    const layoutContext = context.layoutContext!;
    const menuContext = context.resourceContext?.explorer?.menuContext;
    this.register(context);
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
                  <div>新建类型定义</div>
                </div>
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
                  <TypeDefinitionCreationModal
                    context={context}
                    onOk={(info) => {
                      context.resourceContext?.service
                        ?.create({
                          parentId: group.id,
                          kind: "td",
                          name: info.name,
                          config: {
                            type: info.type,
                          },
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
