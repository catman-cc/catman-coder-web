import { DockviewReact, DockviewReadyEvent } from "dockview";
import { useAppDispatch } from "@/stores";
import { useState } from "react";
import * as React from "react";
import { TypeDefinitionListQuery } from "@/stores/typeDefinitions";
import { PanelCollection } from "dockview/dist/cjs/types";
import { IDockviewPanelProps } from "dockview/dist/cjs/dockview/dockview";
import "./index.less";
import {
  ID,
  useApplicationContext,
  DefaultTypeDefinition,
} from "catman-coder-core";
import { Button } from "antd";

const DockviewLayout = () => {
  const dispatch = useAppDispatch();
  const [components, setComponents] = useState<
    PanelCollection<IDockviewPanelProps>
  >({});
  const [event, setEvent] = useState<DockviewReadyEvent>();
  const [ready, setReady] = useState(false);
  let i = 0;
  React.useEffect(() => {
    dispatch(TypeDefinitionListQuery());
  }, []);
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
        id: ID(),
        component: "add",
        params: {},
      });
    }
  }, [ready]);
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      <DockviewReact
        hideBorders={true}
        className="dockview-theme-replit"
        onReady={(event) => {
          setEvent(event);
        }}
        components={{
          E: (props, context) => {
            return renderFactory?.create(props.params);
          },
          add: (props: IDockviewPanelProps<{ td: DefaultTypeDefinition }>) => {
            return (
              <div>
                <Button
                  onClick={() => {
                    i++;
                    var panel = event?.api.addPanel({
                      id: ID(),
                      component: "E",
                      params: {
                        id: ID(),
                        name: "ccc",
                        componentName: "node-service",
                      },
                    });
                    event?.api.addFloatingGroup(panel, {
                      x: 400,
                      y: 400,
                    });
                  }}
                >
                  add
                </Button>
              </div>
            );
          },
        }}
      />
    </div>
  );
};
export default DockviewLayout;
