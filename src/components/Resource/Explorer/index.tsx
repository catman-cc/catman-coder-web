/**
 * 资源视图面板,以树状结构展示所有资源数据
 */
import { useContextMenu } from "react-contexify";
import { Button, Card, Popover, Tree } from "antd";
import type { DataNode, DirectoryTreeProps } from "antd/es/tree";
import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { useApplicationContext } from "@/core";
import "./index.css";
import "react-contexify/dist/ReactContexify.css";
import { useAppDispatch, useAppSelector } from "@/stores";
import { ResourceSlice } from "@/stores/resource";
const { DirectoryTree } = Tree;
import "./index.less";
import IconCN from "@/components/Icon";
import { LabelSelectFactory } from "@/components/LabelSelector/common";
import { SelectorPanel } from "@/components/LabelSelector/SelectorPanel";
// 加载数据后,在转换时,调用上下文处理器,重新处理数据的同时,为其生成合适的icon
/**
 * 一个默认的资源浏览器
 * @constructor
 */
const ResourceExplorer: React.FC = () => {
  const resourceState = useAppSelector((state) => state.resource);
  const dispatch = useAppDispatch();
  // 调用上下文,解析渲染资源
  const applicationContext = useApplicationContext();
  const resourceContext = applicationContext.resourceContext!;

  const explorerContext = resourceContext.explorer!;
  const factory = explorerContext.itemRenderFactory!;
  const resourceConvert = (res: Core.Resource) => {
    const renderResource = factory.render(res);
    if (renderResource) {
      renderResource.resource = res;
      if (res.children) {
        renderResource.children = [];
        for (const child of res.children) {
          const resourceDataNode = resourceConvert(child);
          if (resourceDataNode) {
            renderResource.children.push(resourceDataNode);
          }
        }
      }
      return renderResource;
    }
  };

  const resourceTree = useMemo(() => {
    const root = resourceState.resources["__root_1"];
    if (!root) {
      return {
        key: "__root_1",
        title: "root",
        kind: "resource",
        resourceId: null,
        isLeaf: false,
        children: [],
        resource: {},
      };
    }
    return resourceConvert(root);
  }, [resourceState]);

  useEffect(() => {
    console.log("resourceState", resourceState);
    resourceContext.setResourceStore(resourceState);
  }, [resourceState]);

  const onSelect: DirectoryTreeProps["onSelect"] = (keys, info) => {
    const node = info.node as unknown as Core.ResourceDataNode;
    const resource = node.resource;
    if (resource.kind === "resource") {
      // 资源类型无需特殊处理
      return;
    }
    // 加载具体的资源
    resourceContext.service?.loadDetails(resource).then((response) => {
      const resource = response.data as Core.Resource;
      // 处理资源
      const layoutContext = applicationContext.layoutContext;
      const viewFactory =
        applicationContext.resourceContext?.explorer?.viewFactory;
      viewFactory?.view(resource, applicationContext, layoutContext!);
    });
  };

  const onExpand: DirectoryTreeProps["onExpand"] = (keys, info) => {};

  const menuContext = explorerContext.menuContext!;
  const { show } = useContextMenu({
    id: menuContext!.menus().id,
  });

  const [node, setNode] = useState(resourceTree);
  function displayMenu(e, node: Core.ResourceDataNode) {
    setNode(node);
    show({
      event: e,
      id: menuContext!.menus().id!,
    });
  }
  // publish({
  //     id:"resource-show-model",
  //     name:"resource-show-model",
  //     data:child
  // })
  const [model, setModel] = useState<React.ReactNode>();
  useEffect(() => {
    applicationContext?.events
      ?.watchByName("resource-flush", (e) => {
        dispatch(ResourceSlice.actions.save(e.data));
      })
      .watchByName("resource-remove", (e) => {
        dispatch(ResourceSlice.actions.remove(e.data));
      })
      .watchByName("resource-show-model", (e) => {
        setModel(e.data as ReactNode);
      })
      .watchByName("resource-close-model", (e) => {
        setModel(undefined);
      });
  }, []);
  const [selector, setSelector] = useState<Core.LabelSelector<unknown>>({
    kind: "Equals",
    match: "",
    value: "",
  });

  return (
    // 此处展示了title数据,后面需要放到上下文的控制项中,用于动态处理
    <div>
      <Card
        title={
          <div
            className={"flex justify-between"}
            style={{
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <div>
              <IconCN type={"icon-a-fileresource"} /> 资源管理器
            </div>
            <div>
              <Popover
                style={{ width: "200px" }}
                trigger={"click"}
                placement={"bottomRight"}
                content={
                  <div>
                    <SelectorPanel
                      factory={new LabelSelectFactory()}
                      selector={selector}
                      onChange={(v) => {
                        setSelector(v);
                      }}
                      keyAutoOptions={ResourceNames}
                    />
                  </div>
                }
              >
                <Button
                  size={"small"}
                  shape={"circle"}
                  icon={<IconCN type={"icon-search1"} />}
                ></Button>
              </Popover>
            </div>
          </div>
        }
        size={"small"}
      >
        <DirectoryTree
          className={"resource-explorer"}
          showIcon={true}
          // multiple
          defaultExpandAll
          showLine
          // 后面再处理switchIcon
          // multiple
          onSelect={onSelect}
          onExpand={onExpand}
          onRightClick={(info: { event: React.MouseEvent; node: DataNode }) => {
            displayMenu(info.event, info.node as Core.ResourceDataNode);
          }}
          treeData={[resourceTree!]}
        />
        {menuContext.render(node.resource)}
      </Card>
      {model}
    </div>
  );
};
export const ResourceNames = [
  {
    key: "id",
    name: "id",
    label: "ID",
    value: "id",
    type: "string",
  },
  {
    key: "name",
    name: "name",
    label: "名称",
    value: "name",
    type: "string",
  },
  {
    key: "kind",
    name: "kind",
    label: "类型",
    value: "kind",
    type: "string",
  },
  {
    key: "resourceId",
    name: "resourceId",
    label: "资源ID",
    value: "resourceId",
    type: "string",
  },
  {
    key: "parentId",
    name: "parentId",
    label: "所属资源ID",
    value: "parentId",
    type: "string",
  },
  {
    key: "leaf",
    name: "leaf",
    label: "叶子节点",
    value: "leaf",
    type: "string",
  },
];
export default ResourceExplorer;
