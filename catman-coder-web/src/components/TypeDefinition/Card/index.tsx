import { useAppDispatch, useAppSelector } from "@/stores";
import { TypeDefinitionListQuery } from "@/stores/typeDefinitions";
import { Alert, Card, Divider, List, Spin, Tag } from "antd";
import Meta from "antd/es/card/Meta";
import { useEffect } from "react";
import styled from "styled-components";
import { PeekTypeIcon } from "../common";

interface Props {
  id: string;
}
const Box = styled.div`
  font-size: 10px;
`;

/**
 * 用于展示一个类型定义的卡片
 */
const TypeDefinitionCard = (props: Props) => {
  const td = useAppSelector((state) => state.typeDefinitions).tdMap[props.id];
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(TypeDefinitionListQuery());
  }, [dispatch]);

  return td != undefined ? (
    <Box>
      <Card style={{ width: 300, marginTop: 16 }}>
        <Meta
          avatar={PeekTypeIcon(td.type.typeName)}
          title={td.type.typeName}
        />
        <Divider />
        {/* 选择子元素,两部分: 1. 名称,2:类型*/}

        <List
          dataSource={td.type.items}
          renderItem={(t: TypeDefinition) => {
            return (
              <div>
                <Tag>
                  {PeekTypeIcon(t.type.typeName)}
                  {t.name}
                </Tag>
              </div>
            );
          }}
        />
      </Card>
    </Box>
  ) : (
    <Spin tip="Loading...">
      <Alert
        message="TypeDefinition Was loading."
        description=""
        type="warning"
      />
    </Spin>
  );
};

export default TypeDefinitionCard;
