import { Button } from "antd";
import IconCN from "@/components/Icon";
import * as React from "react";
import { IDockviewPanelProps } from "dockview/dist/cjs/dockview/dockview";
import { useEffect } from "react";

export const FloatAbleTab = (props: IDockviewPanelProps) => {
  const [showFloat, setShowFloat] = React.useState(false);
  const group = props.api.group;

  useEffect(() => {
    props.api.onDidGroupChange(() => {
      const float = !group.model.isFloating || group.panels.length > 1;
      setShowFloat(float);
    });
    props.api.onDidActiveChange(() => {
      const float = !group.model.isFloating || group.panels.length > 1;
      setShowFloat(float);
    });
    group.model.onDidChange(() => {
      const float = !group.model.isFloating || group.panels.length > 1;
      setShowFloat(float);
    });
  }, []);

  return (
    <div
      className={"flex justify-evenly align-middle"}
      style={{
        height: "100%",
        alignItems: "center",
      }}
    >
      <div>{props.api.title}</div>
      <div>
        <Button
          type={"text"}
          shape={"circle"}
          icon={<IconCN type={"icon-close10"} />}
          size={"small"}
          onClick={() => {
            props.api.close();
          }}
        ></Button>
      </div>
      <div>
        {showFloat && (
          <Button
            type={"text"}
            shape={"circle"}
            icon={<IconCN type={"icon-windows"} />}
            size={"small"}
            onClick={() => {
              const p = props.containerApi.getPanel(props.api.id);
              props.containerApi.addFloatingGroup(p);
              setShowFloat(false);
            }}
          ></Button>
        )}
      </div>
    </div>
  );
};
