import {
  ID,
  IPAddressType,
  convertIPAddressType,
  getIPAddressType,
  levenshteinDistance,
  validateIP,
} from "catman-coder-core";
import IconCN from "@/components/Icon";

import { IPStrategy } from "@/services/JoinCode/typeings";
import { AutoComplete, Button, Select, Space, Table, Tooltip } from "antd";
import { useEffect, useState } from "react";
import "./index.less";
export interface IpsEditorProps {
  ips: IPStrategy[];
  onUpdate?: (_ips: IPStrategy[]) => void;
}

export interface IpInfo {
  isDeny: boolean;
  ip: string;
  id: string;
}

export interface IpAutoCompleteProps {
  ip: string;
  id?: string;
  options?: IPStrategy[];
  onUpdate?: (_ip: string) => void;
}

const presetIps: { key: string; value: string }[] = [
  {
    key: "0.0.0.0/0",
    value: "0.0.0.0/0",
  },
  {
    key: "192.168.0.0/24",
    value: "192.168.0.0/24",
  },
  {
    key: "172.16.0.0/24",
    value: "172.16.0.0/24",
  },
  {
    key: "10.0.0.0/8",
    value: "10.0.0.0/8",
  },
  {
    key: "255.255.255.0/24",
    value: "255.255.255.0/24",
  },
  {
    key: "192.0.2.0/28",
    value: "192.0.2.0/28",
  },
  {
    key: "198.51.100.0/24",
    value: "198.51.100.0/24",
  },
  {
    key: "203.0.113.0/24",
    value: "203.0.113.0/24",
  },
  {
    key: "127.0.0.1/32",
    value: "127.0.0.1/32",
  },
  {
    key: "169.254.0.0/16",
    value: "169.254.0.0/16",
  },
  {
    key: "224.0.0.0/4",
    value: "224.0.0.0/4",
  },
  {
    key: "240.0.0.0/4",
    value: "240.0.0.0/4",
  },
];

export const IpAutoComplete = (props: IpAutoCompleteProps) => {
  const [options, setOptions] = useState<{ key: string; value: string }[]>([
    ...presetIps,
    ...(props.options || []).map((opt) => {
      return {
        key: opt.ip || "",
        value: opt.ip || "",
      };
    }),
  ]);
  const [filtedOptions, setFiltedOptions] =
    useState<{ key: string; value: string }[]>(presetIps);
  const [ip, setIp] = useState(props.ip);
  const [inputStyle, setInputStyle] = useState<React.CSSProperties>({});
  const [ipType, setIpType] = useState<IPAddressType>("UNKNOWN");
  useEffect(() => {
    if (props.ip !== ip) {
      setIp(props.ip);
    }
  }, [props]);

  useEffect(() => {
    if (props.ip === ip) {
      return;
    }
    const valiad = validateIP(props.ip);
    if (valiad == 1) {
      setInputStyle({});
      setIpType(getIPAddressType(ip));
    } else if (valiad === -1) {
      setInputStyle({
        border: "1px dashed red",
        borderRadius: "5px",
      });
    } else {
      setInputStyle({
        border: "1px dashed orange",
      });
    }
    if (props.onUpdate) {
      props.onUpdate(ip);
    }
  }, [props, ip]);

  useEffect(() => {
    setFiltedOptions(options);
  }, [options]);

  const onSearch = (value: string): void => {
    setFiltedOptions(
      options
        ?.filter((v) => {
          return v.key.indexOf(value) > -1;
        })
        .sort((a, b) => {
          return (
            levenshteinDistance(a.value, value) -
            levenshteinDistance(b.value, value)
          );
        }) || [],
    );
  };

  const renderIpTypeIcon = (ipType: IPAddressType) => {
    switch (ipType) {
      case "INNER":
        return <IconCN type="icon-siyou2" />;
      case "PUBLIC":
        return <IconCN type="icon-public" />;
      case "RESERVED":
        return <IconCN type="icon-tingche" />;
      case "MULTI-BROADCAST":
        return <IconCN type="icon-guangbo" />;
      case "UNKNOWN":
        return <IconCN type="icon-weizhi1" />;
    }
    return <div></div>;
  };

  return (
    <>
      <AutoComplete
        key={props.id}
        size="small"
        style={{
          width: " 200px",
          ...inputStyle,
        }}
        popupMatchSelectWidth={false}
        options={filtedOptions}
        onSearch={onSearch}
        value={ip}
        onChange={(v) => {
          setIp(v);
        }}
        onSelect={(v) => {
          setIp(v);
        }}
      />
      <Tooltip title={convertIPAddressType(ipType)}>
        {renderIpTypeIcon(ipType)}
      </Tooltip>
    </>
  );
};

export const IpsEditor = (props: IpsEditorProps) => {
  const [ips, setIps] = useState(props.ips);
  useEffect(() => {
    setIps(props.ips);
  }, [props]);
  const update = () => {
    if (props.onUpdate) {
      props.onUpdate([...ips]);
    } else {
      setIps([...ips]);
    }
  };
  return (
    <Table
      size="small"
      showHeader
      pagination={false}
      locale={{
        emptyText: (
          <div>
            <span>😁还没有记录</span>
            <a
              onClick={() => {
                ips.push({
                  isDeny: false,
                  ip: "",
                  id: ID(),
                });
                update();
              }}
            >
              新建一个
            </a>
            吧?
          </div>
        ),
      }}
      columns={[
        {
          key: "strategy",
          title: "策略",
          dataIndex: "isDeny",
          fixed: true,
          width: 100,
          render(value, record, index) {
            return (
              <Select
                size="small"
                value={value ? "deny" : "allow"}
                options={[
                  {
                    label: "允许",
                    value: "allow",
                  },
                  {
                    label: "拒绝",
                    value: "deny",
                  },
                ]}
                onChange={(v) => {
                  record.isDeny = v !== "allow";
                  update();
                }}
              />
            );
          },
        },
        {
          key: "ip",
          title: "ip地址",
          dataIndex: "ip",
          fixed: true,
          render(value, record) {
            return (
              <IpAutoComplete
                key={record.id}
                id={record.id}
                ip={value}
                onUpdate={(v) => {
                  record.ip = v;
                  update();
                }}
              />
            );
          },
        },
        {
          key: "operations",
          title: "",
          dataIndex: "ip",
          fixed: true,
          render(_value, _record, index) {
            return (
              <Space>
                <Tooltip title="新建">
                  <Button
                    size="small"
                    type="text"
                    icon={<IconCN type="icon-Add" />}
                    onClick={() => {
                      ips.push({
                        isDeny: false,
                        ip: "",
                        id: ID(),
                      });
                      update();
                    }}
                  />
                </Tooltip>
                <Tooltip title="删除">
                  <Button
                    size="small"
                    type="text"
                    icon={<IconCN type="icon-Remove" />}
                    onClick={() => {
                      ips.splice(index, 1);
                      update();
                    }}
                  />
                </Tooltip>
              </Space>
            );
          },
        },
      ]}
      dataSource={ips}
    />
  );
};
