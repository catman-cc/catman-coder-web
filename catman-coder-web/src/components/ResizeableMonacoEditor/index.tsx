import MonacoEditor from "react-monaco-editor";
import { useState } from "react";
import { MonacoEditorProps } from "react-monaco-editor/src/types.ts";
import { Resizable, ResizableProps } from "re-resizable";
interface ResizeableMonacoEditorProps {
  monacoConfig?: MonacoEditorProps;
  resizableConfig?: ResizableProps;
}
export const ResizeableMonacoEditor = (props: ResizeableMonacoEditorProps) => {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(200);
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <Resizable>
        <MonacoEditor {...props.monacoConfig} width={width} height={height} />
      </Resizable>
    </div>
  );
};
