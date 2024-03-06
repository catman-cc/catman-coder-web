import { Button, Popover, Tree } from "antd";
import {
  LabelSelector,
  Resource,
  ResourceDetails,
  TypeDefinitionSchema,
  useApplicationContext,
} from "catman-coder-core";
import { useEffect, useState } from "react";
import { SelectorPanel } from "@/components/LabelSelector/SelectorPanel";
import { LabelSelectFactory } from "@/components/LabelSelector/common";
import IconCN from "@/components/Icon";
import { ResourceNames } from "@/components/Resource/Explorer";

export interface SimpleViewProps {
  selector?: string;
  onSelectResource?(resources: ResourceDetails<TypeDefinitionSchema>): void;
}

export const SimpleResourceView = (props: SimpleViewProps) => {
  const context = useApplicationContext();
  const resourceContext = context!.resourceContext!;
  const service = resourceContext.service;
  const factory = resourceContext.explorer!.itemRenderFactory!;
  const [selector, setSelector] = useState<LabelSelector<unknown>>(
    props.selector
      ? JSON.parse(props.selector)
      : {
          match: "kind",
          kind: "Equals",
          value: "td",
        },
  );

  const resourceConvert = (res: Resource) => {
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

  const [tree, setTree] = useState(
    resourceConvert({
      key: "__root_1",
      title: "root",
      kind: "resource",
      resourceId: null,
      isLeaf: false,
      children: [],
      resource: {},
    }),
  );

  useEffect(() => {
    if (props.selector) {
      setSelector(JSON.parse(props.selector));
    }
  }, [props.selector]);

  useEffect(() => {
    service?.root(encodeURIComponent(JSON.stringify(selector))).then((res) => {
      if (res.success) {
        if (res.data) {
          setTree(resourceConvert(res.data));
        } else {
          setTree(
            resourceConvert({
              key: "__root_1",
              title: "root",
              kind: "resource",
              resourceId: null,
              isLeaf: false,
              children: [],
              resource: {},
            }),
          );
        }
      }
    });
  }, [selector]);
  return (
    <div
      style={{
        width: "300px",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          paddingBottom: "5px",
        }}
      >
        <Button
          size={"small"}
          type={"dashed"}
          style={{
            marginRight: "10px",
          }}
          onClick={() => {
            setSelector({
              match: "kind",
              kind: "Equals",
              value: "td",
            });
          }}
          icon={<IconCN type={"icon-xunhuan3"} />}
        >
          重置查询
        </Button>
        <Popover
          placement={"right"}
          content={
            <SelectorPanel
              selector={selector}
              onChange={(s) => {
                setSelector(s);
              }}
              factory={LabelSelectFactory.create()}
              keyAutoOptions={ResourceNames}
            />
          }
        >
          <Button
            size={"small"}
            type={"dashed"}
            style={{
              marginRight: "10px",
            }}
            icon={<IconCN type={"icon-search6"} />}
          >
            构建查询器
          </Button>
        </Popover>
      </div>

      <Tree.DirectoryTree
        showLine
        selectable
        defaultExpandAll
        onSelect={(s, info) => {
          console.log("info.node.resource", info.node.resource);
          if (info.node.resource.kind !== "td") {
            return;
          }
          service?.loadDetails(info.node.resource).then((res) => {
            if (res.success) {
              props.onSelectResource &&
                props.onSelectResource(
                  res.data as ResourceDetails<TypeDefinitionSchema>,
                );
            }
          });
        }}
        treeData={[tree]}
      />
    </div>
  );
};
