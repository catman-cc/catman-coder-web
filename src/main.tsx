import FlexLayout from "@/components/Layouts/FlexLayout/index.tsx";
import config from "@/config";
import { ApplicationContextRC } from "@/core";
import "@/variables.less";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import { store } from "./stores/index.tsx";

import applicationContext from "@/ApplicationContext.tsx";
import BrowerTabLayout from "@/components/Layouts/BrowerTab";
import Dockview from "@/components/Layouts/Dockview";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
// 注册全局数据
interface CatMan {
  plugins: object; // 插件数据
  componentFactory: object; // 组件工厂
  layoutFactory: object; // 布局工厂
}
// 1. 生成初始页面和蒙版,显示加载中
// 2. 准备基础数据(bootstrap).
// 3. 加载配置信息,如果有的话
// 4. 准备核心数据,核心插件
// 5. 加载外部插件
// 6. 调用后台接口,准备数据
// 7. 完成,结束蒙版
window.catman = config;

// 注册processor,并执行启动操作
applicationContext.start();

const router = createBrowserRouter([
  {
    path: "/",
    element: <FlexLayout />,
  },
  {
    path: "/popout",
    element: <BrowerTabLayout />,
  },
  {
    path: "/dockview",
    element: <Dockview />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <ApplicationContextRC value={applicationContext}>
          <div onContextMenu={(e) => {
            e.preventDefault(); // 取消默认行为
          }}>
            <RouterProvider router={router} />
            {/*/!* 此时需要处理特点数据,比如独立窗口是不需要展示布局容器的,仅展示所渲染的资源即可*!/*/}
            {/*<FlexLayout/>*/}
          </div>
        </ApplicationContextRC>
      </DndProvider>
    </Provider>
  </React.StrictMode>,
);
