import {Core} from "@/core/typings";
import {useApplicationContext} from "@/core";
import {useCallback, useEffect, useState} from "react";
import {DefaultLayoutNode} from "@/core/Layout";
import {useSearchParams} from "react-router-dom";

class BrowerTabLayoutRender implements Core.LayoutRender{

    id: string="brower-tab-layout-render";
    nodes: { [p: string]: Core.LayoutNode }={};
    render(node: Core.LayoutNode): void {
        // 开始执行渲染操作

        // 获取组件渲染器执行渲染操作

    }

    support(node: Core.LayoutNode): boolean {
        return node.layoutType==="window";
    }
}

/**
 * 浏览器器布局
 * 理论上pop可以展示任意数据,所以在注册渲染器时,应该考虑到独立渲染的场景,渲染时所需要的数据如果不能直接在url中传递,
 * 那么需要通过后端接口获取,所以,这意味着我需要抽象出一个通用后端接口来获取所有可独立渲染组件所需的数据.
 *
 * 但是,现在还没有足够的数据支撑我设计通用接口,所以暂时只能使用笨拙的方法,独立实现
 *
 * 目前还是只支持resource资源的独立渲染吧,两个值: url?popoutType=resource&id=
 */
export const BrowerTabLayout=()=>{

    const [params]=useSearchParams()
    const popoutType = params.get("popoutType")
    const id=params.get("id")
    if (!popoutType || "resource"!=popoutType||!id){
        // 必传值,如果不存在,渲染错误页面
        return (
            <div style={{
                width:"100vw",
                height:"100vh",
                backgroundColor:"white",
                color:"red",
            }}>
                缺少关键数据
            </div>
        )
    }


    // 根据popoutType的值获取对应的解析器,解析对象,并将解析到的对象传递给上下文中的渲染器,渲染器负责完成渲染操作
    const [resourceDetails,setResourceDetails]=useState<Core.ResourceDetails<unknown>>()

    const applicationContext = useApplicationContext()!;
    // 注册渲染器
    applicationContext.layoutContext?.renderFactory.replace("brower-tab-layout-render",new BrowerTabLayoutRender())
    // 调用service获取数据
    const resourceContext = applicationContext.resourceContext!;

    useEffect(() => {
        resourceContext.service?.findById(id).then(response=>{
            resourceContext.service?.loadDetails(response.data).then(res=>{
                setResourceDetails(res.data as Core.ResourceDetails<unknown>)
            })
        })
    }, []);

    const child=useCallback(()=>{
        const layoutNode = DefaultLayoutNode.of(resourceDetails?.resourceId,resourceDetails?.name,resourceDetails?.kind);
        layoutNode.data=resourceDetails
        applicationContext.layoutContext?.createOrActive(layoutNode,"window")
        return applicationContext.layoutContext?.componentRenderFactory.create(layoutNode)
    },[resourceDetails])
    // 获取到资源数据后,需要将其转换为树状资源

    // resourceContext.service?.loadDetails()
    // 渲染一个新的html页签,修改title

    return <div style={{
        width:"100vw",
        height:"100vh",
        backgroundColor:"white"
    }}>
        {child()}
    </div>
}

export default BrowerTabLayout