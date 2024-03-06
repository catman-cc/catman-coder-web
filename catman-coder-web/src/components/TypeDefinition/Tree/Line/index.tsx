import { DefaultTypeDefinition } from "catman-coder-core";
import MetadataEditor from "@/components/Base";
import IconCN from "@/components/Icon";
import PopoverTab from "@/components/PopoverTab";
import { Button, Col, Input, Popconfirm, Popover, Row } from "antd";
import * as React from "react";
import styled from "styled-components";
import TypeSelectorPanel from "../../TypeSelector";
import { PeekTypeColor, PeekTypeIcon } from "../../common";
import { TypeDefinitionDataNode } from "../TypeDefinitionDataNode";
import "./index.less";
const Box = styled.div`
  justify-items: baseline;
  border-radius: 3px;
  position: relative;
  border-bottom: 1px solid #1890ff;
  &:hover {
    background-color: rgba(197, 197, 197, 0.43);
    filter: brightness(0.85);
  }
`;

const Info = styled.div`
  margin-left: 10px;
  width: 100%;
`;

const TypeTag = styled.span<{ name: string }>`
  color: ${(props) => PeekTypeColor(props.name)};
`;

class LineProps {
  blur: boolean = false; // 当前元素是否获得焦点
  dataNode: TypeDefinitionDataNode;
  isTypeSelector: boolean; // 当前是否处于选中状态
  onTypeSelector: (id: string, finish: boolean) => void; // 当进行类型选择的时候进行回调
  updateTypeData: (key: string | number, td: DefaultTypeDefinition) => void;
  createBrother: (key: string | number) => void;
  createChild: (key: string | number) => void;
  removeItem: (key: string | number) => void;
  toObject: (key?: string | number) => DefaultTypeDefinition;
  showJsonView: (key?: string | number) => void;
  constructor(
    blur: boolean,
    dataNode: TypeDefinitionDataNode,
    isTypeSelector: boolean,
    onTypeSelector: (id: string, finish: boolean) => void,
    updateTypeData: (key: string | number, td: DefaultTypeDefinition) => void,
    createBrother: (key: string | number) => void,
    createChild: (key: string | number) => void,
    removeItem: (key: string | number) => void,
    toObject: (key?: string | number) => DefaultTypeDefinition,
    showJsonView: (key?: string | number) => void
  ) {
    this.blur = blur;
    this.dataNode = dataNode;
    this.isTypeSelector = isTypeSelector;
    this.onTypeSelector = onTypeSelector;
    this.updateTypeData = updateTypeData;
    this.createBrother = createBrother;
    this.createChild = createChild;
    this.removeItem = removeItem;
    this.toObject = toObject;
    this.showJsonView = showJsonView;
  }
}

class LineState {
  blur: boolean = false; // 当前元素是否获得焦点
  td: DefaultTypeDefinition; // 当前行所对应的类型数据
  popoverOpen: boolean = false; // 是否展开类型选择的popover
  settingsPopoverOpen: boolean = false;
  dataNode: TypeDefinitionDataNode;
  constructor(
    blur: boolean,
    td: DefaultTypeDefinition,
    item: TypeDefinitionDataNode
  ) {
    this.blur = blur;
    this.td = td;
    this.dataNode = item;
  }
}

/**
 * 用于维护一个类型定义,包含其相关操作,不处理子元素信息
 */
export default class Line extends React.Component<LineProps, LineState> {
  constructor(props: Readonly<LineProps> | LineProps) {
    super(props);
    this.state = {
      blur: props.blur,
      dataNode: this.props.dataNode,
      td: this.props.dataNode.data.data,
      popoverOpen: this.props.isTypeSelector,
      settingsPopoverOpen: false,
    };
  }

  componentDidUpdate(prevProps: Readonly<LineProps>): void {
    if (prevProps !== this.props) {
      console.log(this.props.dataNode.data.data.type);
      this.setState({
        ...this.state,
        blur: this.props.blur,
        dataNode: this.props.dataNode,
        td: this.props.dataNode.data.data,
        popoverOpen: this.props.isTypeSelector,
      });
    }
  }

  updateTypeDefinition(itemId: string, v: object) {
    this.props.updateTypeData(
      itemId,
      DefaultTypeDefinition.ensure({ ...this.state.td, ...v })
    );
  }

  render() {
    // 分为两个模式,一个是复杂模式,一个是简单模式
    // 复杂模式用来编辑,简单模式用来查看
    // this.props.changeCombine(this.props.item.snapshot.combineWith)
    return (
      <Box>
        <Info>
          <Row>
            <Col span={23}>
              <Row>
                <Col span={5}>
                  <Input
                    className="name-input"
                    style={
                      !this.state.dataNode.data.isBuiltIn()
                        ? {
                            color: PeekTypeColor(
                              this.state.dataNode.data.data.type.typeName
                            ),
                            fontSize: "13px",
                          }
                        : {
                            color: "gray",
                            fontSize: "10px",
                          }
                    }
                    placeholder="请输入参数名称"
                    size={"small"}
                    defaultValue={this.state.dataNode.data.data.name}
                    // bordered={!this.state.dataNode.data.isBuiltIn() && this.state.blur}
                    // allowClear={!this.state.dataNode.data.isBuiltIn() && this.state.blur}
                    disabled={
                      this.state.dataNode.data.isBuiltIn() ||
                      !this.state.dataNode.data.canEditor()
                    }
                    // suffix={PeekTypeIcon(item.data.td.type.typeName) }

                    onChange={(e) => {
                      // 做一个简单的防抖操作
                      const shake = setTimeout(() => {
                        clearTimeout(shake);
                        const value = e.target.value;
                        // 回调父组件,传回去新的值
                        this.updateTypeDefinition(
                          this.state.dataNode.key as string,
                          { name: value }
                        );
                        // this.props.updateTypeData(item.id,{...this.state.td,name:value})
                      }, 200);
                    }}
                  />
                </Col>
                <Col
                  span={19}
                  style={{
                    display: "inline-flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <Col span={1} />
                    <Col span={2}>
                      {
                        <Popover
                          placement="right"
                          title={"类型选择"}
                          // open={this.state.popoverOpen}
                          content={
                            <TypeSelectorPanel
                              type={this.state.dataNode.data.data.type}
                              completeTheSelection={(type) => {
                                // 回调,更新数据类型
                                this.props.updateTypeData(
                                  String(this.state.dataNode.key),
                                  DefaultTypeDefinition.ensure({
                                    ...this.state.td,
                                    type: type,
                                  })
                                );
                              }}
                            />
                          }
                          trigger="click"
                        >
                          <Button
                            type={this.state.blur ? "default" : "text"}
                            disabled={!this.state.dataNode.data.canEditor()}
                            style={{
                              // backgroundColor: PeekTypeColor(item.data.td.type.typeName),
                              color: PeekTypeColor(
                                this.state.dataNode.data.data.type.typeName
                              ),
                              fontSize: 14,
                            }}
                            icon={
                              <span style={{ filter: "revert" }}>
                                {PeekTypeIcon(
                                  this.state.dataNode.data.data.type.typeName
                                )}
                              </span>
                            }
                            size={"small"}
                            // shape={"round"}
                            onClick={() => {
                              // this.setState({ ...this.state, popoverOpen: true })
                              // this.props.onTypeSelector(
                              //   this.state.td.id,
                              //   false,
                              // );
                            }}
                            // icon={peekTypeIcon(item.data.td.type.typeName)}
                          >
                            <TypeTag
                              name={this.state.dataNode.data.data.type.typeName}
                            ></TypeTag>
                            {this.state.dataNode.data.data.type.typeName}
                          </Button>
                        </Popover>
                      }
                    </Col>
                    <Col span={2} />
                    <Col span={10}>
                      {
                        <Input
                          className="describe-input"
                          placeholder="描述信息"
                          size={"small"}
                          defaultValue={this.state.td.describe}
                          onChange={(e) => {
                            const shake = setTimeout(() => {
                              clearTimeout(shake);
                              const value = e.target.value;
                              // 回调父组件,传回去新的值
                              this.props.updateTypeData(
                                String(this.state.dataNode.key),
                                DefaultTypeDefinition.ensure({
                                  ...this.state.td,
                                  describe: value,
                                })
                              );
                            }, 200);
                          }}
                          bordered={this.state.blur}
                          allowClear={this.state.blur}
                        />
                        // )
                      }
                    </Col>
                  </div>
                  <div
                    style={{
                      display: "block",
                      justifyContent: "space-between",
                    }}
                  >
                    <Col span={8} style={{ display: "flex", gap: "10px" }}>
                      {/* style={this.state.blur ? { display: "flex", justifyContent: "end" } : { display: "none" }} */}
                      <Button
                        style={
                          !this.state.dataNode.data.isBuiltIn() &&
                          this.state.dataNode.data.canAddBrother()
                            ? {}
                            : { display: "none" }
                        }
                        shape={"circle"}
                        type={"text"}
                        size={"small"}
                        onClick={() => {
                          this.props.createBrother(
                            this.props.dataNode.data.data.id
                          );
                        }}
                      >
                        <IconCN type={"icon-add"} />
                        {/*<MdOutlineAddCircle style={{ color: "#03940b" }} />*/}
                      </Button>
                      {
                        <Button
                          style={
                            this.state.dataNode.data.canAddChild()
                              ? {}
                              : { display: "none" }
                          }
                          shape={"circle"}
                          type={"text"}
                          size={"small"}
                          onClick={() => {
                            this.props.createChild(
                              this.props.dataNode.data.data.id
                            );
                          }}
                        >
                          <IconCN type={"icon-branches"} />
                          {/*<TiFlowChildren style={{ color: "#4b4b4b" }} />*/}
                        </Button>
                      }

                      <Button
                        type={"text"}
                        size={"small"}
                        danger
                        onClick={() => {
                          this.props.showJsonView(
                            String(this.state.dataNode.key)
                          );
                        }}
                        icon={<IconCN type={"icon-json-xml"} />}
                      />
                      <PopoverTab
                        id={this.state.td.id}
                        name={`[${this.state.td.name}]元数据设置`}
                        component=""
                        rootClassName="metadata-editor-popover"
                        content={
                          <MetadataEditor
                            metadata={this.state.td}
                            update={(metadata) => {
                              console.log({
                                ...this.state.td,
                                ...metadata,
                              });
                              this.props.updateTypeData(
                                String(this.state.dataNode.key),
                                DefaultTypeDefinition.ensure({
                                  ...this.state.td,
                                  ...metadata,
                                })
                              );
                            }}
                          />
                        }
                        title={
                          <div className="flex justify-between">
                            <div>高级设置</div>
                          </div>
                        }
                        trigger="click"
                        placement="left"
                        open={this.state.settingsPopoverOpen}
                        onOpenChange={(v) => {
                          this.setState({
                            ...this.state,
                            settingsPopoverOpen: v,
                          });
                        }}
                      >
                        <Button
                          // style={(this.state.dataNode.data.isBuiltIn() || !this.state.dataNode.data.canEditor()) ? { visibility: "hidden" } : {}}
                          // disabled={this.state.dataNode.data.isBuiltIn() || !this.state.dataNode.data.canEditor()}
                          shape={"circle"}
                          type={"text"}
                          size={"small"}
                          onClick={() => {}}
                        >
                          <IconCN
                            type={
                              "icon-setting-preferences-gear-office-application-structure-define-process-fbaaebdf"
                            }
                          />
                          {/*<AiFillDelete style={{ color: "#ff6464" }} />*/}
                        </Button>
                      </PopoverTab>
                      {/* <Popover
                                                className="metadata-editor-popover"
                                                content={
                                                    <Resizable className="metadata-editor-popover" enable={false}>
                                                        <MetadataEditor metadata={this.state.td} update={(metadata) => {
                                                            console.log({
                                                                ...this.state.td,
                                                                ...metadata
                                                            })
                                                            this.props.updateTypeData(String(this.state.dataNode.key)
                                                                , DefaultTypeDefinition.ensure(({ ...this.state.td, ...metadata })))
                                                            // this.props.updateTypeData(

                                                            //     this.state.td.id, DefaultTypeDefinition.ensure({
                                                            //         ...this.state.td,
                                                            //         ...metadata
                                                            //     })
                                                            // )
                                                        }} />
                                                    </Resizable>
                                                }
                                                title=<div className="flex justify-between">
                                                    <div>
                                                        高级设置
                                                    </div>
                                                    <div>
                                                        <Tooltip title="使用弹窗编辑" placement="topLeft">
                                                            <Button size="small" type="text" icon=<IconCN type="icon-export" onClick={() => {
                                                                // EventBus.emit(FlexLayout)
                                                            }}></IconCN> />
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                                trigger="click"
                                                // placement="left"
                                                open={this.state.settingsPopoverOpen}
                                                onOpenChange={(v) => {
                                                    this.setState({
                                                        ...this.state,
                                                        settingsPopoverOpen: v
                                                    })
                                                }}
                                            >
                                                <Button
                                                    // style={(this.state.dataNode.data.isBuiltIn() || !this.state.dataNode.data.canEditor()) ? { visibility: "hidden" } : {}}
                                                    // disabled={this.state.dataNode.data.isBuiltIn() || !this.state.dataNode.data.canEditor()}
                                                    shape={"circle"} type={"text"} size={"small"}
                                                    onClick={() => {
                                                    }}>
                                                    <IconCN type={"icon-setting-preferences-gear-office-application-structure-define-process-fbaaebdf"} />
                                                    {/*<AiFillDelete style={{ color: "#ff6464" }} />*/}
                      {/* </Button> */}
                      {/* </Popover> */}

                      <Popconfirm
                        title="警告⚠️"
                        description="是否删除本项及其子项?"
                        onConfirm={() => {
                          this.props.removeItem(
                            String(this.state.dataNode.key)
                          );
                        }}
                        // onCancel={cancel}
                        okText="是"
                        cancelText="否"
                      >
                        <Button
                          style={
                            this.state.dataNode.data.isBuiltIn() ||
                            !this.state.dataNode.data.canEditor()
                              ? { visibility: "hidden" }
                              : {}
                          }
                          disabled={
                            this.state.dataNode.data.isBuiltIn() ||
                            !this.state.dataNode.data.canEditor()
                          }
                          shape={"circle"}
                          type={"text"}
                          size={"small"}
                          onClick={() => {}}
                        >
                          <IconCN type={"icon-Delete"} />
                          {/*<AiFillDelete style={{ color: "#ff6464" }} />*/}
                        </Button>
                      </Popconfirm>
                    </Col>
                    <Col span={1} />
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Info>
      </Box>
    );
  }
}
