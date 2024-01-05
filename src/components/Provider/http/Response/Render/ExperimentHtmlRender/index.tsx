import { useEffect, useRef } from "react";

export const ExperimentHtmlRenderer = ({
  htmlContent,
  baseURL,
}: {
  htmlContent: string;
  baseURL: string;
}) => {
  const containerRef = useRef(null);
  let container: any = null;
  let shadowRoot: any = undefined;
  useEffect(() => {
    if (shadowRoot) {
      return;
    }
    container = containerRef.current;
    shadowRoot = container.attachShadow({ mode: "closed" });
  }, [containerRef]);
  useEffect(() => {
    // 创建一个 range
    const range = document.createRange();
    range.selectNode(container);

    // 解析 HTML 内容
    const parsedContent = range.createContextualFragment(htmlContent);

    // 处理各种资源链接为绝对路径
    const processAttributes = (element, ...attributes) => {
      attributes.forEach((attribute) => {
        const value = element.getAttribute(attribute);
        if (value && !value.startsWith("http") && !value.startsWith("//")) {
          // 判断是否为相对路径，如果是则转换为绝对路径
          element.setAttribute(attribute, baseURL + value);
        }
      });
    };

    const processElement = (element) => {
      if (element.nodeType === Node.ELEMENT_NODE) {
        // 处理元素的各种资源链接
        processAttributes(element, "src", "href", "content");

        // 递归处理子元素
        element.childNodes.forEach(processElement);
      }
    };

    // 递归处理 HTML 内容中的各种资源链接
    parsedContent.childNodes.forEach(processElement);

    // 处理脚本
    const processScripts = () => {
      const scripts = parsedContent.querySelectorAll("script");
      scripts.forEach((script) => {
        // 创建一个新的 script 元素，避免在全局执行
        const clonedScript = document.createElement("script");
        clonedScript.textContent = script.textContent;
        shadowRoot.appendChild(clonedScript);
      });
    };

    processScripts();

    // 将处理后的 HTML 内容注入 Shadow DOM
    shadowRoot.appendChild(parsedContent);
  }, [htmlContent, baseURL]);

  return <div ref={containerRef} />;
};
