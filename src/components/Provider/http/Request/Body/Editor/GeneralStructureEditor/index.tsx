import { Button, Input, Select, Switch, Table, Upload } from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

/**
 *  一个通用的基于表格实现的结构编辑器,通过嵌套子表格实现复杂结构的编辑
 */
interface Props {
  dataSource?: Data[];
  // columns: any[]
  // rowKey: string
}
interface Data {
  key: string;
  name: string;
  type: string;
  value: string;
  description: string;
  children?: Data[];
}

const renderValueEditor = (
  record: Data,
  data: Data[],
  setData: Dispatch<SetStateAction<Data[]>>,
) => {
  if (record.type === "object" || record.type === "array") {
  }
  if (record.type === "file") {
    return (
      <Upload
        name={"file"}
        action={"/"}
        beforeUpload={(file) => {
          // 将文件数据转换为json数据
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function () {
            record.value = reader.result as string;
            setData([...data]);
          };
          return false;
        }}
      >
        <Button icon={"upload"}>上传</Button>
      </Upload>
    );
  }
  if (record.type === "boolean") {
    return (
      <Switch
        checked={record.value === "true"}
        onChange={(v) => {
          record.value = v ? "true" : "false";
          setData([...data]);
        }}
      />
    );
  }
  return (
    <Input
      value={record.value}
      onChange={(e) => {
        record.value = e.target.value;
        setData([...data]);
      }}
    />
  );
};

export const GeneralStructureEditor = (props: Props) => {
  const [json, setJson] = useState("");
  const [data, setData] = useState<Data[]>([]);
  const [types, setTypes] = useState<string[]>([
    "string",
    "number",
    "boolean",
    "object",
    "array",
    "file",
  ]);
  useEffect(() => {
    // 将表格数据转换为json
    const json = JSON.stringify(data);
    setJson(json);
    console.log(json);
  }, [data]);
  const columns = [
    {
      key: "1",
      name: "参数名称",
      dataIndex: "name",
      render: (text: string, record: Data) => {
        return (
          <Input
            style={{ width: "80%" }}
            value={text}
            onChange={(e) => {
              record.name = e.target.value;
              setData([...data]);
            }}
          />
        );
      },
    },
    {
      key: "2",
      name: "参数类型",
      dataIndex: "type",
      render: (text: string, record: Data) => {
        return (
          <Select
            value={text}
            onChange={(e) => {
              const old = record.type;
              const oldIsComplex = old === "object" || old === "array";
              const newIsComplex = e === "object" || e === "array";
              if (newIsComplex && !oldIsComplex) {
                record.children = [];
              } else if (!newIsComplex && oldIsComplex) {
                delete record.children;
              }
              record.type = e;
              setData([...data]);
            }}
            options={types.map((v) => {
              return { label: v, value: v };
            })}
          />
        );
      },
    },
    {
      key: "3",
      name: "参数值",
      dataIndex: "value",
      render: (text: string, record: Data) => {
        return <div>{renderValueEditor(record, data, setData)}</div>;
      },
    },
  ];
  return (
    <Table
      title={() => {
        // 添加按钮组,支持添加数据
        return (
          <div>
            <Button
              onClick={() => {
                data.push({
                  key: "1",
                  name: "参数名称",
                  type: "string",
                  value: "参数值",
                  description: "参数描述",
                });
                setData([...data]);
              }}
            >
              添加
            </Button>
          </div>
        );
      }}
      showHeader={true}
      dataSource={data}
      columns={columns}
      pagination={false}
      size="small"
      bordered
    />
  );
};
