import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {defaultResourceService} from "@/services/resource";
import {useFocus} from "@floating-ui/react";

const rootId="__root_1"
const rootName="root"
const kind="resource"

const name="resource"
export interface ResourceState {
    rootResource:Core.Resource
    resources:{
        [index:string]:Core.Resource
    }
}
export const RootResourceQuery=createAsyncThunk(
    "resource/root",
    async ()=>{
        return defaultResourceService.root()
    }
)
const initialState:ResourceState={
    rootResource:{
        id:rootId,
        name:rootName,
        kind:kind, children: [], isLeaf: false, parentId: "", resourceId: ""
    },
    resources:{}
}


export const ResourceSlice=createSlice({
    name,
    initialState,
    reducers:{
        save(state,action:PayloadAction<Core.Resource>){
            const resource = action.payload;
            function save(resource:Core.Resource){
                if (resource.id===rootId){
                    resource.parentId="";
                }else if (!resource.parentId){
                    resource.parentId=rootId
                }
                state.resources[resource.id]=resource

                if (!resource.parentId){
                    return
                }
                const parent = state.resources[resource.parentId] as Core.Resource;
                if (!parent.children){
                    parent.children=[resource]
                }else {
                    const find = parent.children.findIndex(c=>c.id===resource.id);
                    if (find>=0){
                        parent.children[find]=resource
                    }else {
                        parent.children.push(resource)
                    }
                }
                if (parent){
                    save(parent)
                }
            }
            save(resource)

            // 不知道为什么需要递归修改父级依赖

            // state.rootResource={...state.rootResource}
            // state.resources[resource.parentId]={...parent,children:[...parent.children]}
            // state.resources={...state.resources}
            return
        },
        remove(state,action:PayloadAction<Core.Resource>){
            const resource = action.payload;
            if (resource.parentId){
               const parent = state.resources[resource.parentId];
                const find = parent.children.findIndex(c=>c.id===resource.id);
                if (find>=0){
                    parent.children.splice(find,1)
                }
            }
            delete state.resources[resource.id]
        }
    },
    extraReducers:(builder)=>{
        builder.addCase(RootResourceQuery.fulfilled,(state, action)=>{
            // 解析整个root
            const rootResource = action.payload.data;
            state.rootResource=rootResource
            state.resources[rootResource.id]=rootResource
            // 递归处理
            const recursionHandlerResource=(resource:Core.Resource)=>{
                if (!resource.children){
                    resource.children=[]
                }
                if (resource.children){
                    for (const child of resource.children) {
                        state.resources[child.id]=child
                        recursionHandlerResource(child)
                    }
                }
            }
           recursionHandlerResource(rootResource)
        })
    }
})

export default ResourceSlice.reducer