import { useEffect, useRef } from "react";

export const HtmlRenderer = ({ htmlContent, baseURL }: { htmlContent: string, baseURL: string }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    const iframeDocument = iframe.contentDocument;

    if (iframeDocument) {
      // 处理 HTML 内容
      const parsedContent = new DOMParser().parseFromString(htmlContent, 'text/html');

      // 设置基础地址
      const baseElement = document.createElement('base');
      baseElement.href = baseURL;
      parsedContent.head.insertBefore(baseElement, parsedContent.head.firstChild);

      // 将处理后的 HTML 内容注入 iframe
      iframeDocument.open();
      iframeDocument.write(parsedContent.documentElement.outerHTML);
      iframeDocument.close();
    }
  }, [htmlContent, baseURL]);


  return <div style={{ width: '100%', height: '100%', border: 'none', overflow: 'hidden' }}>
    <iframe ref={iframeRef} title="Rendered Content" style={{ width: '100%', height: '100%', border: 'none', overflow: 'hidden' }}
      sandbox="allow-same-origin allow-scripts "
    />
  </div>
};

