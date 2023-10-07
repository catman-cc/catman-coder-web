import { Layout, Space } from 'antd';
import { useState } from 'react';

const { Header, Footer, Sider, Content } = Layout;

// import './App.css'
import { Outlet } from "react-router";

const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#fff',
    height: 64,
    paddingInline: 50,
    lineHeight: '64px',
    backgroundColor: '#7dbcea',
};

const contentStyle: React.CSSProperties = {
    position: "relative",
    width: 1000,
    height: "100vh",
    color: '#fff',
    backgroundColor: '#108ee9',
};

const siderStyle: React.CSSProperties = {
    textAlign: 'center',
    lineHeight: '120px',
    color: '#fff',
    backgroundColor: '#3ba0e9',
};



function App() {
    const [count, setCount] = useState(0)

    return (
        <Space direction="vertical" style={{ width: '100vw', height: "100vh" }} size={[0, 48]}>
            <Layout style={{ width: '100vw', height: "100vh" }}>
                <Sider style={siderStyle}>
                    <nav>
                        <ul>
                            <li>
                                <a href={`/rc`}>rc</a>
                            </li>
                            <li>
                                <a href={`/flex`}>flex</a>
                            </li>
                            <li>
                                <a href={`/dock`}>dock</a>
                            </li>
                        </ul>
                    </nav>
                </Sider>
                <Layout>
                    <Content style={contentStyle}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Space>
    )
}

export default App
