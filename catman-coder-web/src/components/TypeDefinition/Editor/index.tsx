/**
 *  TypeDefinition Editor
 *  提供完整的数据编辑服务
 */

import { DefaultTypeDefinition, Events, EventBus } from "catman-coder-core";
import FlowExample from "@/components/TypeDefinition/Flow";
import { convert } from "@/components/TypeDefinition/Flow/TypeDefinition/TypeDefinionHandler";
import { useAppDispatch } from "@/stores";
import { TypeDefinitionSave } from "@/stores/typeDefinitions";
import { CodeSandboxOutlined } from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Drawer,
  DrawerProps,
  Dropdown,
  Space,
  Switch,
  Tag,
} from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import { Actions, TabNode } from "flexlayout-react";
import { ReactNode, useEffect, useState } from "react";
import ReactJson from "react-json-view";
import styled from "styled-components";
import VanillaJSONEditor from "../Json/vanilla/VanillaJSONEditor";
import TypeDefinitionTreePanel from "../Tree";
import { TypeDefinitionTree } from "../Tree/TypeDefinitionDataNode";
import "./index.less";
interface Props {
  td: DefaultTypeDefinition;
  node: TabNode;
}

const ToolBar = styled.div`
  display: flex;
  /* justify-content: ; */
  align-items: center;
  padding: 0 10px;
`;
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 10px;
  gap: 10px;
`;
const cache: {
  [index: string]: JSX.Element;
} = {};

const tips = [
  "🐼TIPS: 结构图可以帮助您更直观的查看数据结构定义是否符合预期",
  "🐻: 在展开的结构视图中,如果从右往左查看时,发现了1:n的关系,表示数据结构有问题",
];

const Editor = (props: Props) => {
  const dispatch = useAppDispatch();
  const [tree, setTree] = useState(
    TypeDefinitionTree.of(DefaultTypeDefinition.ensure(props.td))
  );
  const [tipIndex, setTipIndex] = useState(0);

  const title = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>🐼结构图-{props.td.name}</div>
        <div>
          <small
            style={{
              fontSize: 10,
              color: "gray",
            }}
          >
            {tips[tipIndex]}
          </small>
        </div>
      </div>
    );
  };

  useEffect(() => {
    setTimeout(() => {
      setTipIndex(tipIndex + 1 >= tips.length ? 0 : tipIndex + 1);
    }, 3000);
    setDrawerView({
      ...drawerView!,
      config: { ...drawerView?.config, title: title() },
    });
  }, [tipIndex]);

  // json 编辑器
  const [jsonView, setJsonView] = useState<{
    show: boolean;
    itemId?: string;
    simple?: boolean;
    flow?: boolean;
  }>({ show: false, simple: false, flow: false });

  const [drawerView, setDrawerView] = useState<{
    show: boolean;
    child?: ReactNode;
    config?: DrawerProps;
  }>();

  // ReactJson解析大数据包会有卡顿,所以直接采用复杂模式,该模式能够有效减少延迟

  const loadFromCache = (id: string | undefined, simple: boolean) => {
    const rid = (simple ? "simple-" : "complex") + (id || "");

    if (!cache[rid]) {
      const obj = tree.toJsonObject(id);
      cache[rid] = simple ? (
        <ReactJson src={obj} />
      ) : (
        <VanillaJSONEditor
          content={{ json: JSON.parse(JSON.stringify(obj)) }}
        />
      );
    }
    return cache[rid];
  };

  return (
    <div>
      <Row>
        {/* 工具栏,负责提供一组快捷工具,分为左右两栏,右侧区域提供保存,导出,导入等功能 */}
        <div>
          <Space align="center" style={{}}>
            <Avatar
              style={{ backgroundColor: "#1677ff" }}
              icon={<CodeSandboxOutlined />}
            />

            <Paragraph
              style={{
                margin: 0,
              }}
              copyable={{
                text: props.td.id,
              }}
            >
              <Tag color="blue">id: {props.td.id}</Tag>
            </Paragraph>
          </Space>
        </div>
        <ToolBar>
          <Badge
            count={999}
            color="orange"
            style={{
              marginRight: 20,
            }}
          >
            <Button
              style={{
                marginRight: 30,
              }}
              type="dashed"
              size="small"
              onClick={() => {
                setJsonView({ ...jsonView, show: true });
              }}
            >
              查看引用
            </Button>
          </Badge>

          <Button
            style={{
              marginRight: 30,
            }}
            type="dashed"
            size="small"
            onClick={() => {
              // JSON.stringify(convert(tree.toObject(jsonView.itemId))),
              setDrawerView({
                ...{
                  show: true,
                  child: <FlowExample td={props.td} />,
                  config: {
                    ...{
                      title: title(),
                      width: 1200,
                      onClose: () => {
                        setDrawerView({
                          show: false,
                        });
                      },
                    },
                  },
                },
              });
              // setJsonView({ ...jsonView, show: true })
            }}
          >
            结构图{" "}
          </Button>

          <Dropdown.Button
            type="primary"
            size="small"
            onClick={() => {
              const obj = tree.toObject().unWrapper();
              dispatch(TypeDefinitionSave(obj));
              props.node
                .getModel()
                .doAction(Actions.renameTab(props.node.getId(), obj.name));
            }}
            menu={{
              items: [
                {
                  key: "1",
                  label: "查看类型定义元数据",
                  onClick: () => {
                    const obj = tree.toObject().unWrapper();
                    setDrawerView({
                      ...{
                        show: true,
                        child: (
                          <VanillaJSONEditor
                            content={{
                              json: JSON.parse(JSON.stringify(obj)),
                            }}
                          />
                        ),
                        config: {
                          ...{
                            title: title(),
                            width: 1200,
                            onClose: () => {
                              setDrawerView({
                                show: false,
                              });
                            },
                          },
                        },
                      },
                    });
                  },
                },
                {
                  key: "2",
                  label: "2nd item",
                },
                {
                  key: "3",
                  label: "3rd item",
                },
              ],
              onClick: (e) => {
                console.log(e);
              },
            }}
          >
            保存
          </Dropdown.Button>
        </ToolBar>
      </Row>

      {/* 参数面板 */}
      <Card hoverable>
        <TypeDefinitionTreePanel
          tree={tree}
          setTree={(t) => {
            setTree(t);
          }}
          showJson={(id) => {
            setJsonView({
              ...jsonView,
              show: true,
              itemId: id,
            });
          }}
        />
      </Card>

      <Divider />
      {/* 抽屉必须放在这一层,否则弹出窗口将无法正确使用抽屉 */}
      <Drawer
        title={
          <div>
            <Tag>JSON FORMAT</Tag>{" "}
            <Switch
              checkedChildren="简单"
              unCheckedChildren="复杂"
              defaultChecked
              onChange={() => {
                setJsonView({ ...jsonView, simple: !jsonView?.simple });
              }}
            />
            <Button
              onClick={() => {
                EventBus.emit(Events.Layout.ADD_TAB, {
                  type: "tab",
                  id: `5123-${jsonView.itemId}`,
                  name: "JSONVIEW",
                  component: "JsonView",
                  // floating: true,
                  helpText: "123",
                  config: {
                    data: tree.toJsonObject(jsonView.itemId),
                  },
                  enableClose: false,
                  className: "TypeDefinitionMenuIcon",
                  icon: "icon-type",
                });
                setJsonView({
                  ...jsonView,
                  show: false,
                });
              }}
            >
              独立标签
            </Button>
            <Button
              onClick={() => {
                EventBus.emit(Events.Layout.ADD_TAB, {
                  type: "tab",
                  id: `monaco-editor-${jsonView.itemId}`,
                  name: "monaco-editor",
                  component: "MonacoCodeEditor",
                  // floating: true,
                  helpText: "123",
                  config: {
                    data: JSON.stringify(tree.toJsonObject(jsonView.itemId)),
                  },
                  enableClose: true,
                  className: "TypeDefinitionMenuIcon",
                  icon: "icon-type",
                });
                setJsonView({
                  ...jsonView,
                  show: false,
                });
              }}
            >
              Monaco Editor
            </Button>
            <Button
              onClick={() => {
                EventBus.emit(Events.Layout.ADD_TAB, {
                  type: "tab",
                  id: `monaco-editor-${jsonView.itemId}`,
                  name: "monaco-editor",
                  component: "MonacoCodeEditor",
                  // floating: true,
                  helpText: "通过源码审视你的数据结构是否合理",
                  config: {
                    data: JSON.stringify(
                      convert(tree.toObject(jsonView.itemId))
                    ),
                  },
                  enableClose: true,
                  className: "TypeDefinitionMenuIcon",
                  icon: "icon-type",
                });
                setJsonView({
                  ...jsonView,
                  show: false,
                });
              }}
            >
              Flow Monaco Editor
            </Button>
          </div>
        }
        width={720}
        // getContainer={false}
        open={jsonView.show}
        bodyStyle={{ paddingBottom: 80 }}
        onClose={() => {
          setJsonView({
            ...jsonView,
            show: false,
          });
        }}
      >
        {jsonView.show ? (
          loadFromCache(jsonView.itemId, jsonView.simple || false)
        ) : (
          <div></div>
        )}
      </Drawer>

      <Drawer
        open={drawerView?.show || drawerView?.config?.open}
        {...drawerView?.config}
      >
        {drawerView?.child}
      </Drawer>
    </div>
  );
};

export default Editor;
