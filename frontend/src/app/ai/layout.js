"use client"

import { Layout, Menu } from "antd";
import { useEffect, useState } from "react";
import { useRouter } from 'next-nprogress-bar';
import { getSelectedKeys, getOpenKeys, getMenuItems, getRedirectPath, BASIC_MENU } from "@/util/menu";

const { Header, Footer, Sider, Content } = Layout;
const window = globalThis;

const RootLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [me, setMe] = useState({ name: 'username', user_type: 'user' });
    const router = useRouter();
    const [route, setRoute] = useState(globalThis?.__incrementalCache?.requestHeaders?.['x-invoke-path']);

    const [selectedKeys, setSelectedKeys] = useState([]);
    const [openKeys, setOpenKeys] = useState([]);
    const [menuItem, setMenuItem] = useState([]);

    useEffect(() => {
        setMenuItem(getMenuItems(me, BASIC_MENU));
        setSelectedKeys(getSelectedKeys(route, BASIC_MENU));
        openKeys.push(...getOpenKeys(route, BASIC_MENU));
        setOpenKeys(openKeys);
    }, [me, route, openKeys]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (route != window.location.pathname) {
                setRoute(window.location.pathname);
                clearInterval(interval);
            }
        }, 1000);
    }, [route])

    return (
        <Layout style={{
            minHeight: '100vh',
            backgroundColor: 'transparent',
        }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} style={{
                borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
            }} theme='light'>
                <div className={"h-16 flex items-center justify-center flex-row flex-wrap px-5 pt-5"}>
                    <div className={collapsed ? "opacity-0" : "opacity-100"}>
                        <h2 className={"text-lg mt-2"}>消息队列实验</h2>
                    </div>
                </div>

                <Menu
                    mode="inline"
                    items={menuItem}
                    selectedKeys={selectedKeys}
                    defaultOpenKeys={openKeys}
                    onSelect={({ key }) => {
                        setSelectedKeys([key]);
                    }}
                    style={{
                        marginTop: collapsed ? '0px' : '30px',
                    }}
                    onClick={({ key }) => {
                        router.push(getRedirectPath(me, BASIC_MENU, key));
                    }}
                />
            </Sider>
            <Layout style={{
                backgroundColor: 'transparent',
            }}>
                <Content className="overflow-auto h-[calc(100vh-64px)]">
                    {children}
                </Content>
            </Layout>
        </Layout>
    )
}

export default RootLayout;
