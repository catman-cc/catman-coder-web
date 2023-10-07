import App from "@/App.tsx"
import DockviewLayout from "@/components/Layouts/Dockview"
import FlexLayout from '@/components/Layouts/FlexLayout/index.tsx'
import RCDockLayout from "@/components/Layouts/RcDock"
import '@/variables.less'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserRouter } from "react-router-dom"
import './index.css'
import { store } from './stores/index.tsx'
// import App from "@/App.tsx";
const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "flex",
                element: <FlexLayout />
            },
            {
                path: "dock",
                element: <DockviewLayout />
            },
            {
                path: "rc",
                element: <RCDockLayout />
            }
        ]
    },

]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <div>
                <FlexLayout />
            </div>


            {/* <RouterProvider router={router}/> */}
        </Provider>
    </React.StrictMode>,
)
