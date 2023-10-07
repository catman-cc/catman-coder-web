import { DefaultTypeDefinition } from "@/common/core";
import TypeDefinitionTreePanel from "@/components/TypeDefinition/Tree";
import { useAppDispatch, useAppSelector } from "@/stores";
import { TypeDefinitionListQuery } from "@/stores/typeDefinitions";
import { Button } from "antd";
import DockLayout from 'rc-dock';
import "rc-dock/dist/rc-dock.css";
import * as React from "react";
import { useRef } from "react";


const RCDockLayout = () => {
    const tdStore = useAppSelector(state => state.typeDefinitions)
    const dispatch = useAppDispatch()
    const dock = useRef<DockLayout | null>(null);
    let i = 0
    React.useEffect(() => {
        dispatch(TypeDefinitionListQuery())
    }, [])


    return tdStore.tds.length > 0 ? <DockLayout
        ref={dock}
        defaultLayout={{
            dockbox: {
                mode: 'horizontal',
                children: [
                    {
                        id: "my_panel",
                        tabs: [{
                            id: "add", title: "add",
                            content: <Button onClick={() => {
                                const td = tdStore.tds[i++]
                                const panel = dock.current?.find("my_panel")
                                if (!panel) return
                                dock.current?.dockMove({ id: td.id, title: td.name, content: <TypeDefinitionTreePanel td={DefaultTypeDefinition.ensure(td)} /> }, panel, "right")
                            }}>add</Button>
                        }]

                    },
                ]
            }
        }}
        // layout={layout}
        dropMode={"edge"}

        style={{
            position: "absolute",
            left: 10,
            top: 10,
            right: 10,
            bottom: 10,
        }}
    /> : <div />
}

export default RCDockLayout