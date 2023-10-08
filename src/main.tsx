import FlexLayout from '@/components/Layouts/FlexLayout/index.tsx'
import '@/variables.less'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import { store } from './stores/index.tsx'


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <div>
                <FlexLayout />
            </div>
        </Provider>
    </React.StrictMode>,
)
