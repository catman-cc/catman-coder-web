import { useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";

import ResizeHandle from "./ResizeHandle";
import styles from "./styles.module.css";

// 渲染resize面板
const Menus = () => {
    const [showFirstPanel, setShowFirstPanel] = useState(true);
    const [showLastPanel, setShowLastPanel] = useState(true);
    return (
        <div className={styles.Container}>
            <div className={styles.TopRow}>
                <p>
                    <button
                        className={styles.Button}
                        onClick={() => setShowFirstPanel(!showFirstPanel)}
                    >
                        {showFirstPanel ? "hide" : "show"} top panel
                    </button>
                    &nbsp;
                    <button
                        className={styles.Button}
                        onClick={() => setShowLastPanel(!showLastPanel)}
                    >
                        {showLastPanel ? "hide" : "show"} bottom panel
                    </button>
                </p>
                {/*  控制展示模式,比如分块展示,还是共享同一个面板 */}
            </div>

            <div className={styles.BottomRow}>
                <PanelGroup autoSaveId="example" direction="vertical">
                    {showFirstPanel && (
                        <>
                            <Panel
                                className={styles.Panel}
                                collapsible={true}
                                defaultSize={20}
                                order={1}
                            >
                                <div className={styles.PanelContent}>top</div>
                            </Panel>
                            <ResizeHandle />
                        </>
                    )}
                    <Panel className={styles.Panel} collapsible={true} order={2}>
                        <div className={styles.PanelContent}>middle</div>
                    </Panel>
                    {showLastPanel && (
                        <>
                            <ResizeHandle />
                            <Panel
                                className={styles.Panel}
                                collapsible={true}
                                defaultSize={20}
                                order={3}
                            >
                                <div className={styles.PanelContent}>bottom</div>
                            </Panel>
                        </>
                    )}
                </PanelGroup>
            </div>
            <div>
                此处定义一个可以横向滚动的icon列表
            </div>
        </div>
    )
}

export default Menus