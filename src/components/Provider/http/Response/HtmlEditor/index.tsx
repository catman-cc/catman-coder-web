import React from "react";
import { Editor } from "@monaco-editor/react";
import { getMonacoLanguageId } from "@/common/monaco";

const HtmlEditor = (props: { code: string; contentType?: string }) => {
  const [code, setCode] = React.useState(props.code);
  React.useEffect(() => {
    setCode(props.code);
  }, [props.code]);

  return (
    <Editor
      width={"100%"}
      height={"100%"}
      language={getMonacoLanguageId(props.contentType || "text/plain")}
      value={code}
      options={{
        minimap: {
          enabled: false,
        },
        wrappingStrategy: "advanced",
      }}
    />
  );
};

export default HtmlEditor;
