import { Editor } from "@monaco-editor/react";
import React from "react";

export const RawBody = ({
  body,
  contentType,
}: {
  body: string;
  contentType: string;
}) => {
  const [language, setLanguage] = React.useState("json");
  React.useEffect(() => {
    if (contentType.includes("json")) {
      setLanguage("json");
    } else if (contentType.includes("xml")) {
      setLanguage("xml");
    } else if (contentType.includes("html")) {
      setLanguage("html");
    } else if (contentType.includes("text")) {
      setLanguage("text");
    } else {
      setLanguage("json");
    }
  }, [contentType]);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <Editor
        language={language}
        value={body}
        options={{
          // readOnly: true,
          minimap: {
            enabled: false,
          },
        }}
      />
    </div>
  );
};
