import { Card, Input, Tag } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import { IDockviewPanelProps } from "dockview";
import "./index.less";
export interface FunctionBasicInfoProps {
    dockView?: IDockviewPanelProps;
}

export const FunctionBasicInfo = (
    props: FunctionBasicInfoProps
) => {

    return <div>
        <Card>
            <div className="function-basic-info">
                <div className="labeld">
                    <div>
                        id: <Tag>1112321</Tag>
                    </div>
                    <div>
                        <Input size="small" />
                    </div>
                </div>
                <div className="labeld">
                    <div>
                        名称:
                    </div>
                    <div>
                        <Input size="small" />
                    </div>
                </div>
                <div className="labeld">
                    <div>是否内置:</div>
                    <div>
                        <Tag>内置</Tag>
                    </div>
                </div>
                <div className="labeld">
                    <div>函数类型:</div>
                    <div>
                        <Tag>if</Tag>
                    </div>
                </div>
                <div>
                    <Paragraph>
                        这是一个简单的描述信息,比如,这里假设这是一个if语句
                    </Paragraph>
                </div>
            </div>
        </Card>
    </div>
}