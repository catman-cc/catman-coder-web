import {DockviewReact, DockviewReadyEvent} from 'dockview';
import {useAppDispatch, useAppSelector} from "@/stores";
import {useState} from "react";
import * as React from "react";
import {TypeDefinitionListQuery} from "@/stores/typeDefinitions";
import TypeDefinitionTreePanel from "@/components/TypeDefinition/Tree";
import {DefaultTypeDefinition} from "@/common/core.ts";
import {PanelCollection} from "dockview/dist/cjs/types";
import {IDockviewPanelProps} from "dockview/dist/cjs/dockview/dockview";
import "./index.less"
import {ID} from "@/common/id";
import {Button} from "antd";
const TDTP= (props: IDockviewPanelProps<{ td: DefaultTypeDefinition }>) =>{
    return <TypeDefinitionTreePanel td={props.params.td}/>
}
const DockviewLayout=()=>{
    const tdStore = useAppSelector(state => state.typeDefinitions)
    const dispatch = useAppDispatch()
    const [components,setComponents]=useState<PanelCollection<IDockviewPanelProps>>({})
    const [event,setEvent]=useState<DockviewReadyEvent>()
    const [ready,setReady]=useState(false)
    let i=0
    React.useEffect(() => {
        dispatch(TypeDefinitionListQuery())
    }, [])

    React.useEffect(()=>{

        if (event){
            setReady(true)
            // tdStore.tds.forEach(td=>{
            //     event.api.addPanel({
            //         id: td.id!+ID(),
            //         component:"default",
            //         params:{
            //             td:td
            //         }
            //     })
            // })
            // event.api.addPanel({
            //     id: "add",
            //     component:"add",
            //     params:{
            //     }
            // })
        }
        // tdStore.tds.forEach(td=>{
        //     components[td.id!]=TDTP
        // })
        // setComponents({...components})
    }, [tdStore.tds],)

    React.useEffect(()=>{
     if (ready){
         event?.api.addPanel({
             id: "add",
             component:"add",
             params:{
             }
         })
     }
    },[ready])
    return <div  style={
        {
            width:"80vw",
            height:"80vh"
        }
    }>
        <DockviewReact
           className="dockview-theme-replit"
            onReady={(event=>{
                setEvent(event)
                if (tdStore.tds.length>1){
                    setReady(true)
                }

                // event.api.addPanel({
                //     id: ID(),
                //     component:"add",
                //     params:{
                //     }
                // })
                  // if (tdStore.tds.length>0){
                //     tdStore.tds.forEach(td=>{
                //         event.api.addPanel({
                //             id: td.id!+ID(),
                //             component:"default",
                //             params:{
                //                 td:td
                //             }
                //         })
                //     })
                // }

            })}
           components={
            {
                default:TDTP,
                add:(props: IDockviewPanelProps<{ td: DefaultTypeDefinition }>) =>{
                    return <Button
                        onClick={()=>{
                            console.log(i)
                            const td=tdStore.tds[i]
                            i++
                            event?.api.addPanel({
                                id: td.id!+ID(),
                                component:"default",
                                params:{
                                    td:td
                                }
                            })
                        }}
                    >add</Button>
                }
            }
        }/>
    </div>
}
export  default DockviewLayout