import {
  DockviewDefaultTab,
  DockviewReact,
  DockviewReadyEvent,
} from "dockview";
import { useState } from "react";
import * as React from "react";
import "./index.less";
import { useApplicationContext } from "@/core";
import {
  Http,
  HttpValueProvider,
  HttpValueProviderInformation,
} from "@/components/Provider/http";
import { Button, Card } from "antd";
import { TbFloatCenter } from "react-icons/tb";
import { ResponseView } from "@/components/Provider/http/Response";
import { DataSnapshot } from "@/components/Provider/http/Request/Body/DataSnapshot";
import { DockViewContextRC } from "@/components/Provider/http/DockView/Context";

import { FloatAbleTab } from "@/components/Provider/http/DockView/FloatAbleTab";

/**
 * DockViewHttpProvider,提供了面板管理的能力
 * @param props
 * @constructor
 */
export const DockViewHttpProvider = (props: { resource: Core.Resource }) => {
  const [event, setEvent] = useState<DockviewReadyEvent>();
  const [ready, setReady] = useState(false);
  const [response, setResponse] = useState<{
    statusCode: number;
    body: string;
    headers: { [key: string]: string[] };
    consumeTime: number;
  }>();
  const [http, setHttp] = useState<Http>();

  const context = useApplicationContext();
  const renderFactory = context.layoutContext?.componentRenderFactory;
  React.useEffect(() => {
    if (event) {
      setReady(true);
    }
  }, [event]);
  React.useEffect(() => {
    if (ready) {
      event?.api.addPanel({
        id: "请求信息",
        component: "http",
        tabComponent: "hideClose",
        params: {
          resource: props.resource,
        },
      });
    }
  }, [ready]);
  React.useEffect(() => {
    if (http) {
      const group = event?.api.activeGroup;
      const panel = event?.api.getPanel("响应信息");
      if (panel) {
        panel.api.updateParameters({
          http: http,
        });
        panel.api.setActive();
        return;
      }
      event?.api.addPanel({
        id: "响应信息",
        component: "res",
        tabComponent: "floatAble",
        floating: {
          width: 800,
          height: 400,
        },
        params: {
          http: http,
        },
      });
    }
  }, [http]);

  return (
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
          rightHeaderActionsComponent={(props) => {
            if (
              props.activePanel?.id === "res" &&
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
            E: (props) => {
              return renderFactory?.create(props.params);
            },
            http: (props) => {
              console.log(props.params);
              return (
                <Card size={"small"}>
                  <HttpValueProvider
                    data={
                      JSON.parse(
                        props.params.resource?.extra || "{}",
                      ) as HttpValueProviderInformation
                    }
                    onSave={(data) => {
                      props.params.resource.extra = JSON.stringify(data);
                      context.resourceContext?.service
                        ?.save(props.params.resource)
                        .then((res) => {
                          if (res.data) {
                            // 处理资源
                            context.events?.publish({
                              id: "resource-flush",
                              name: "resource-flush",
                              data: res.data,
                            });
                          }
                        });
                    }}
                    onResponse={(res) => {
                      setResponse(res);
                    }}
                    onRequestDone={(res) => {
                      setHttp(res);
                    }}
                    dockView={props}
                  />
                </Card>
              );
            },
            res: (props) => {
              return <ResponseView http={props.params.http} />;
            },
            snapshot: (props) => {
              return (
                <DataSnapshot data={props.params.snaps} dockview={props} />
              );
            },
          }}
        />
      </DockViewContextRC>
    </div>
  );
};
