import { findAllSimples } from "@/services/typeDefinitions";
import { Select } from "antd";
import { useEffect, useState } from "react";

export const TypeDefinitionSelect = ({
  value,
  onSelect,
}: {
  value?: string;
  onSelect?: (value: string) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Core.TypeDefinition[]>([]);

  useEffect(() => {
    findAllSimples().then((res) => {
      if (res.success) {
        setData(res.data);
      }
      setLoading(false);
    });
  }, []);
  return (
    <Select
      loading={loading}
      showSearch
      style={{ width: 200 }}
      value={value}
      onSelect={onSelect}
      getPopupContainer={(triggerNode) => triggerNode.parentNode}
      popupMatchSelectWidth={false}
      options={data.map((d) => {
        return {
          label: d.name,
          value: d.id,
        };
      })}
    />
  );
};
