import { getMonacoLanguageId } from "catman-coder-core";
import { HtmlRenderer } from "@/components/Provider/http/Response/Render/HtmlRenderer";
import { Http } from "@/components/Provider/http";
import ReactJson from "react-json-view";
import { useState } from "react";
import { Select } from "antd";
import "./index.less";
import { QuickerCodeEditor } from "@/components/QuickerCodeEditor";
import { ExperimentHtmlRenderer } from "@/components/Provider/http/Response/Render/ExperimentHtmlRender";
export interface RenderProps {
  content: string;
  contentType?: string;
  http: Http;
}
export const Render = (props: RenderProps) => {
  const [language, setLanguage] = useState(
    getMonacoLanguageId(props.contentType || "text/plain"),
  );
  return (
    <div className={"response-render"}>
      <div className={"response-render-title"}>
        选择渲染模式:{" "}
        <Select
          defaultValue={language}
          popupMatchSelectWidth={false}
          onChange={(value) => setLanguage(value)}
          options={[
            { value: "html", label: "网页" },
            { value: "experiment-html", label: "实验性网页" },
            { value: "json", label: "JSON视图" },
            { value: "code", label: "代码编辑器" },
          ]}
        />
      </div>
      <div className={"response-render-body"}>
        {language === "html" && (
          <HtmlRenderer
            htmlContent={props.content}
            baseURL={props.http.response.uri}
          />
        )}
        {language === "json" && <ReactJson src={tryParseJSON(props.content)} />}
        {language === "code" && <QuickerCodeEditor value={props.content} />}
        {language === "experiment-html" && (
          <ExperimentHtmlRenderer
            htmlContent={props.content}
            baseURL={props.http.response.uri}
          />
        )}
      </div>
    </div>
  );
};
function tryParseJSON(jsonString: string) {
  try {
    const o = JSON.parse(jsonString);
    if (o && typeof o === "object") {
      return o;
    }
  } catch (e) {
    return {
      error: e.message,
      suggestion: "Please check your JSON format,or use another render mode.",
      value: jsonString,
    };
  }
  return false;
}
