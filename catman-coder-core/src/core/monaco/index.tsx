export function getMonacoLanguageId(contentType: string) {
  // 将 contentType 转换为小写以便于匹配
  const lowerCaseContentType = contentType.toLowerCase().split(";")[0].trim();
  // 定义映射关系
  const contentTypeToMonacoLanguageIdMap: { [index: string]: string } = {
    "application/json": "json",
    "application/xml": "xml",
    "text/xml": "xml",
    "text/html": "html",
    "application/javascript": "javascript",
    "text/javascript": "javascript",
    "application/typescript": "typescript",
    "text/typescript": "typescript",
    "application/css": "css",
    "text/css": "css",
    "text/plain": "plaintext",
    "application/java": "java", // Java
    "text/x-java-source": "java", // Java
    "application/x-httpd-php": "php", // PHP
    "text/x-php": "php", // PHP
    "application/python": "python", // Python
    "text/x-python": "python", // Python
    "application/x-ruby": "ruby", // Ruby
    "text/x-ruby": "ruby", // Ruby
    "application/xml+xhtml": "xml", // XHTML
    "application/xhtml+xml": "xml", // XHTML
    "application/rss+xml": "xml", // RSS
    "application/atom+xml": "xml", // Atom
    "application/sql": "sql", // SQL
    "text/x-sql": "sql", // SQL
    "text/yaml": "yaml", // YAML
    "application/yaml": "yaml", // YAML
    "text/x-yaml": "yaml", // YAML
  };

  // 查找映射关系并返回对应的 Monaco 语言 ID
  return contentTypeToMonacoLanguageIdMap[lowerCaseContentType] || "plaintext";
}
