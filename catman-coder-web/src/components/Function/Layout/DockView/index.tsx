/**
 * 基于docker view实现一个function的编排窗口
 * function主要由以下几部分构成:
 *  - 固定头部,展示一些按钮,任务信息之类的数据,暂时没想好
 * - 基础信息面板,展示function的id,name,描述等内容
 * - 参数定义,为了便于在编排任务时,查看参数定义,需要提供一个独立的参数模块窗口,两种视图,一种是标准视图,另一种是简洁视图
 * - 任务编排定义,内置任务有可能不支持内部编排,所以该窗口是可选的
 * - 任务支持debug模式,因此在debug模式下,又多了
 *   - 断点展示
 *   - 任务堆栈展示
 *   - 变量展示
 *   - 如果可以的话,展示任务的执行时间
 */
import { DockViewContextRC } from "@/components/Provider/http/DockView/Context";
import { useApplicationContext } from "@/core";
import { Button } from "antd";
import {
  DockviewDefaultTab,
  DockviewReact,
  DockviewReadyEvent,
} from "dockview";
import * as React from "react";
import { useState } from "react";
import { TbFloatCenter } from "react-icons/tb";
import "./index.less";

import IconCN from "@/components/Icon";
import { FloatAbleTab } from "@/components/Provider/http/DockView/FloatAbleTab";
import { FunctionArgsPanel } from "../../ArgsPanel";
import { FunctionBasicInfo } from "../../BasicInfo";
import { FunctionFlowEditor } from "@/components/Function/FunctionEditor";

/**
 * DockViewHttpProvider,提供了面板管理的能力
 * @param props
 * @constructor
 */
export const DockViewFunctionInfoProvider = (props: {
  resource: Core.Resource;
}) => {
  const [event, setEvent] = useState<DockviewReadyEvent>();
  const [ready, setReady] = useState(false);

  const context = useApplicationContext();
  const renderFactory = context.layoutContext?.componentRenderFactory;
  React.useEffect(() => {
    if (event) {
      setReady(true);
    }
  }, [event]);
  React.useEffect(() => {
    if (ready) {
      const mainPanel = event?.api.addPanel({
        id: "function-basic-info",
        component: "basicInfo",
        tabComponent: "hideClose",
        params: {},
        // position: {
        //     referenceGroup: leftGroup!,
        //     direction: "left"
        // }
      });

      event?.api.addPanel({
        id: "functionFlowEditor",
        title: "编辑任务流程",
        component: "functionFlowEditor",
        tabComponent: "hideClose",
        params: {},
        position: {
          referencePanel: "function-basic-info",
          direction: "below",
        },
      });

      // 出入参分组,目前来看300的宽度比较合适
      const argsPanel = event?.api
        .addPanel({
          id: "typeDefinitionEdiotrArgs",
          title: "参数定义[入]",
          component: "typeDefinitionEdiotr",
          tabComponent: "hideClose",
          params: {},
          position: {
            referencePanel: "function-basic-info",
            direction: "left",
          },
        })
        .api.setSize({
          width: 300,
        });

      event?.api.addPanel({
        id: "typeDefinitionEdiotrResult",
        title: "参数定义[出]",
        component: "typeDefinitionEdiotr",
        tabComponent: "hideClose",
        params: {},
        position: {
          referencePanel: "typeDefinitionEdiotrArgs",
          direction: "below",
        },
      });
      // event?.api.addPanel({
      //     id: "typeDefinitionEdiotrResult",
      //     title: "参数定义[出]",
      //     component: "typeDefinitionEdiotr",
      //     tabComponent: "hideClose",
      //     params: {
      //     },
      //     position: {
      //         referencePanel: "typeDefinitionEdiotrArgs",
      //         direction: "below"
      //     }
      // })
    }
  }, [ready]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div className="bottom-tabs">
        <div>
          {["1.入参", "2.出参", "3.基本信息", "4.文档", "5.流程"].map((n) => {
            return (
              <Button size="small" type="default">
                {n}
              </Button>
            );
          })}
        </div>
        <div className={"bottom-tabs-actions"}>
          <Button
            size={"small"}
            type={"default"}
            icon={<IconCN type={"icon-wendang1"} />}
          />
          <Button
            size={"small"}
            type={"default"}
            icon={<IconCN type={"icon-lock2"} />}
          />
          <Button
            size={"small"}
            type={"default"}
            icon={<IconCN type={"icon-job-execute"} />}
          />
          <Button
            size={"small"}
            type={"default"}
            icon={<IconCN type={"icon-debug3"} />}
          />
        </div>
      </div>
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <DockViewContextRC value={event?.api}>
          <DockviewReact
            hideBorders={true}
            className="dockview-theme-replit"
            onReady={(event) => {
              setEvent(event);
            }}
            prefixHeaderActionsComponent={(props) => {
              if (
                props.activePanel?.id === "function-basic-info" &&
                !props.activePanel?.group.model.isFloating
              ) {
                return (
                  <Button
                    onClick={() => {
                      event?.api.addFloatingGroup(props.activePanel!);
                    }}
                    icon={<TbFloatCenter />}
                  />
                );
              }
            }}
            rightHeaderActionsComponent={(props) => {
              // if (
              //     props.activePanel?.id === "function-basic-info" &&
              //     !props.activePanel?.group.model.isFloating
              // ) {
              //     return (
              //         <Button
              //             onClick={() => {
              //                 event?.api.addFloatingGroup(props.activePanel!);
              //             }}
              //             icon={<TbFloatCenter />}
              //         />
              //     );
              // }
              return (
                <Button
                  onClick={() => {
                    if (event?.api.hasMaximizedGroup()) {
                      event.api.exitMaxmizedGroup();
                    } else {
                      event?.api.maximizeGroup(props.activePanel!);
                    }
                  }}
                  icon={<IconCN type="icon-maxmize1" />}
                />
              );
            }}
            tabComponents={{
              hideClose: (props) => {
                if (props.api.group.model.isFloating) {
                  return (
                    <Button
                      onClick={() => {
                        event?.api.addFloatingGroup(props.api.group);
                      }}
                    >
                      123
                    </Button>
                  );
                }
                return <DockviewDefaultTab {...props} hideClose={true} />;
              },
              floatAble: (props) => {
                return <FloatAbleTab {...props} />;
              },
            }}
            components={{
              basicInfo: (props) => {
                return <FunctionBasicInfo dockView={props} />;
              },
              typeDefinitionEdiotr: (props) => {
                return <FunctionArgsPanel />;
              },
              functionFlowEditor: (props) => {
                return <FunctionFlowEditor />;
              },
            }}
          />
        </DockViewContextRC>
      </div>
    </div>
  );
};
