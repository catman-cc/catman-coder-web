import { useReactFlow, useStoreApi } from "reactflow";
import { useState } from "react";
import MonacoCodeEditor from "@/components/CodeEditor";

export const ReactFlowDataWatcher = () => {
  const flow = useReactFlow();
  const store = useStoreApi();

  const [code, setCode] = useState<string>("");
  store.subscribe((data) => {
    setCode(JSON.stringify(flow.toObject()));
  });
  return (
    <div>
      <MonacoCodeEditor code={code} />
    </div>
  );
};
