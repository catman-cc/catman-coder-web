import FlexLayout from "@/components/Layouts/FlexLayout/index.tsx";
import "@/variables.less";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import { store } from "@/stores";

import applicationContext from "@/ApplicationContext.tsx";
import BrowerTabLayout from "@/components/Layouts/BrowerTab";
import Dockview from "@/components/Layouts/Dockview";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DefaultApplicationContext } from "catman-coder-core";

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
          <div
            onContextMenu={(e) => {
              e.preventDefault(); // 取消默认行为
            }}
          >
            <RouterProvider router={router} />
            {/*/!* 此时需要处理特点数据,比如独立窗口是不需要展示布局容器的,仅展示所渲染的资源即可*!/*/}
            {/*<FlexLayout/>*/}
          </div>
        </ApplicationContextRC>
      </DndProvider>
    </Provider>
  </React.StrictMode>
);
