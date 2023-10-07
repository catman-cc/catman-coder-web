// import { Button } from "antd"
// import FlexLayout from "./FlexLayout"
// import FloatWindow from "./FlexLayout/Float"
// import TypeDefinitionMenu from "../TypeDefinition/Menu"
// import { TabNode } from "flexlayout-react"
// import Editor from "../TypeDefinition/Editor"
// import ReactJson from "react-json-view"
// import MonacoCodeEditor from "../CodeEditor"
// import WinBoxManager from "./FlexLayout/WinBox"
// import { CacheableFactory, DefaultFactory } from "./FlexLayout/Factory"


// const BaseLayout = () => {

//     const factory = CacheableFactory.of(DefaultFactory.create()
//         .nameMatch("button", (node) => {
//             return <Button>{node.getName()}</Button>
//         })
//         .nameMatch("TypeDefinitionMenu", (node: TabNode) => {
//             return <TypeDefinitionMenu node={node} layoutRef={layoutRef} />
//         })
//         // .nameMatch("TypeDefinitionTreePanel", (node: TabNode) => {
//         //     return <TypeDefinitionTreePanel td={node.getExtraData().td} />
//         // })
//         .nameMatch("TypeDefinitionTreePanel", (node: TabNode) => {
//             return <Editor td={node.getExtraData().td} node={node} />
//         })
//         .nameMatch("JsonView", (node: TabNode) => {
//             return <ReactJson src={node.getConfig().data} />
//         })
//         .nameMatch("MonacoCodeEditor", (node: TabNode) => {
//             return <MonacoCodeEditor code={node.getConfig().data as string} />
//         })
//         .nameMatch("WinBoxManager", (node) => {
//             return <WinBoxManager
//                 key={`default-winbox-manager-${node.getId()}`}
//                 windows={winBoxs}
//             />
//         })
//     )

//     // 为了避免窗口在切换时,重新渲染数据,二者必须能够访问到同一个缓存数据
//     // 这就需要确保两个窗口都支持factory创建模式,且两个窗口针对同一组数据,需要拥有一致的标志符(针对内容区域)
//     // 此处作缓存,当布局管理器调用 pin 或者 tab之类的方法时,本地先缓存元素, 然后调用布局管理器,布局管理器再访问缓存

//     // 将创建浮动窗口的方法传递给Flex

//     // 将额外创建内部标签的方法传递给Float

//     return <div>
//         <FlexLayout />

//         <FloatWindow
//             title="123"
//             content="123"
//         />
//     </div>
// }
// export default BaseLayout