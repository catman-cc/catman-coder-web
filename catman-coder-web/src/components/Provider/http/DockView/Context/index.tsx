import {createContext, PropsWithChildren, useContext} from "react";
import {DockviewApi} from "dockview";

const DockViewContext = createContext<DockviewApi|undefined>(undefined)

export function DockViewContextRC(
    props:PropsWithChildren<{value:(DockviewApi|undefined)}>
){
    const {value,children}=props
    return (
        <DockViewContext.Provider value={value}>
            <div style={{
                width:"100%",
                height:"100%"
            }}>
                {children}
            </div>
        </DockViewContext.Provider>
    )
}

export function useDockViewContext(){
    return useContext(DockViewContext)
}
