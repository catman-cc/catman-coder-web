import MonacoCodeEditor from "@/components/CodeEditor";
import IconCN from "@/components/Icon";
import {
  CacheableFactory,
  DefaultComponentFactory,
  Factory,
  RefuseNodeComponentFactory,
} from "@/core/Layout/Factory.tsx";
import Menus from "@/components/Menus";
import ParameterEditor from "@/components/Parameter/Editor";
import ParameterMenu from "@/components/Parameter/menu";
import ResourceExplorer from "@/components/Resource/Explorer";
import Editor from "@/components/TypeDefinition/Editor";
import TypeDefinitionMenu from "@/components/TypeDefinition/Menu";
import { Button } from "antd";
import { IJsonModel, Layout, TabNode } from "flexlayout-react";
import { ReactNode, RefObject } from "react";
import ReactJson from "react-json-view";

interface CatMan {
  plugins: object; // 插件数据
  componentFactory: object; // 组件工厂
  layout: {
    model: IJsonModel;
    layoutFactory: Factory; // 布局工厂
    ref: RefObject<Layout> | undefined;
  };
}

// 默认样式布局
const DefaultLayout: IJsonModel = {
  global: {
    enableRotateBorderIcons: false,
    tabEnableRenderOnDemand: false,
    tabIcon: "close",
    borderClassName: "border",
    tabEnableFloat: true,
  },
  borders: [
    {
      type: "border",
      config: {
        type: ["td"],
      },
      autoSelectTabWhenOpen: true,
      autoSelectTabWhenClosed: true,
      show: true,
      size: 300,
      location: "left",
      enableDrop: false,
      className: "border-left",
      // barSize: 50,
      selected: 0, // 默认选中
      children: [
        {
          type: "tab",
          id: "#56c90a5b-d84f-4e73-8e27-d824e21f4aa6",
          name: "资源视图",
          component: "ResourceExplorer",
          enableRename: false,
          floating: true,
          enableFloat: true,
          // enableDrag: false,
          helpText: "展示所有参数定义",
          enableClose: false,
          className: "TypeDefinitionMenuIcon",
          icon: "icon-a-fileresource",
        },
        {
          type: "tab",
          id: "#56c90a5b-d84f-4e73-8e27-d824e21f4aa2",
          name: "数据类型定义",
          enableRename: false,
          component: "TypeDefinitionMenu",
          floating: true,
          enableFloat: true,
          enableDrag: false,
          helpText: "展示所有数据类型定义",
          config: {
            type: "td",
          },
          enableClose: false,
          className: "TypeDefinitionMenuIcon",
          icon: "icon-type",
        },
        {
          type: "tab",
          enableRename: false,
          id: "#56c90a5b-d84f-4e73-8e27-d824e21f4aa3",
          name: "参数定义",
          component: "ParameterMenu",
          floating: true,
          enableFloat: true,
          // enableDrag: false,
          helpText: "展示所有参数定义",
          enableClose: false,
          className: "TypeDefinitionMenuIcon",
          icon: "icon-moxing",
        },
        {
          type: "tab",
          enableRename: false,
          id: "#56c90a5b-d84f-4e73-8e27-d824e21f4aa5",
          name: "参数定义",
          component: "menus",
          floating: true,
          enableFloat: true,
          // enableDrag: false,
          helpText: "展示所有参数定义",
          enableClose: false,
          className: "TypeDefinitionMenuIcon",
          icon: "icon-moxing",
        },
      ],
    },
    {
      type: "border",
      config: {
        type: ["td"],
      },
      // "size": 300,
      location: "bottom",
      children: [],
    },
    {
      type: "border",
      config: {
        type: ["td"],
      },
      // "size": 300,
      location: "right",
      children: [],
    },
  ],
  layout: {
    type: "row",
    id: "#fa5496cc-ead0-4170-9a32-f2066522e55f",
    children: [
      {
        type: "tabset",
        id: "#688e372a-3c7b-4bdd-977d-bfa6a3736f9f",
        selected: -1,
        children: [],
        active: true,
      },
    ],
  },
};

// 全局数据配置: 插件,组件工厂,样式工厂...
const factory = RefuseNodeComponentFactory.of(
  CacheableFactory.of(
    DefaultComponentFactory.create()
      .nameMatch("button", (node) => {
        return <Button>{node.getName()}</Button>;
      })
      .nameMatch("TypeDefinitionMenu", (node: TabNode) => {
        return (
          <TypeDefinitionMenu node={node} layoutRef={global.layout.ref!} />
        );
      })
      .nameMatch("ParameterMenu", (node) => {
        return <ParameterMenu />;
      })
      .nameMatch("ParameterEditor", (node) => {
        return (
          <ParameterEditor params={node.getConfig().data as Core.Parameter} />
        );
      })
      .nameMatch("menus", (node) => {
        return <Menus />;
      })
      // .nameMatch("TypeDefinitionTreePanel", (node: TabNode) => {
      //     return <TypeDefinitionTreePanel td={node.getExtraData().td} />
      // })
      .nameMatch("TypeDefinitionTreePanel", (node: TabNode) => {
        return <Editor td={node.getConfig().td} node={node} />;
      })
      .nameMatch("JsonView", (node: TabNode) => {
        return <ReactJson src={node.getConfig().data} />;
      })
      .nameMatch("MonacoCodeEditor", (node: TabNode) => {
        return <MonacoCodeEditor code={node.getConfig().data as string} />;
      })
      .nameMatch("ResourceExplorer", (node: TabNode) => {
        return <ResourceExplorer />;
      }),
  ),
);

const global = {
  plugins: {},
  componentFactory: {},
  layout: {
    model: DefaultLayout,
    layoutFactory: factory,
    ref: undefined,
  },
  resource: {
    itemRenderFactory: undefined,
  },
} as CatMan;

export default global;
