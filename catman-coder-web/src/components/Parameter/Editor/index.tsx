import { DefaultTypeDefinition } from "@/common/core";
import BaseTitle from "@/components/Base/Title";
import IconCN from "@/components/Icon";
import {
  PeekTypeColor,
  PeekTypeIcon,
} from "@/components/TypeDefinition/common";
import { useAppDispatch } from "@/stores";
import { ParameterSave } from "@/stores/parameter";
import { Button, Input, Table } from "antd";
import { parseToParameterTree } from "./ParameterTableConvert";

interface Props {
  params: Parameter;
}

interface TableData {
  key: string;
  name: string;
  data: Parameter;
  type: DefaultTypeDefinition;
  children: TableData[];
}

const ParameterEditor = (props: Props) => {
  const dispatch = useAppDispatch();

  return (
    <div>
      <div className="flex justify-between  toolbar">
        <div className="">
          <BaseTitle
            icon={<IconCN type="json" />}
            show={{
              id: true,
              group: true,
              name: true,
            }}
            data={props.params as unknown as Base}
            copyable={false}
            update={() => {}}
          />
        </div>
        <div className="">
          <Button
            onClick={() => {
              dispatch(ParameterSave(props.params));
            }}
          >
            保存
          </Button>
        </div>
      </div>
      <Table
        size="small"
        columns={[
          {
            title: "name",
            dataIndex: "name",
            key: "name",
            render: (_value, record) => {
              return (
                <div
                  style={{
                    color: PeekTypeColor(record.data.type.type.typeName),
                  }}
                >
                  {record.data.name}
                </div>
              );
            },
          },
          {
            key: "type",
            title: "type",
            render: (_value, record) => {
              return PeekTypeIcon(record.data.type.type.typeName);
            },
          },
          {
            key: "value",
            title: "取值方式",
            render: () => {
              return <Input defaultValue={"继承自父级"}></Input>;
            },
          },
          {
            key: "default-value",
            title: "默认值",
            render: () => {
              return <Input defaultValue={"继承自父级"}></Input>;
            },
          },
        ]}
        bordered
        pagination={false}
        dataSource={[parseToParameterTree(props.params)]}
      />
    </div>
  );
};

export default ParameterEditor;
