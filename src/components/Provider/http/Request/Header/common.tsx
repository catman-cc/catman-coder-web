export interface CandidateHeaders {
  [key: string]: string[];
}

// http常用请求头,以及其常用值,构成的对象
export const commonRequestHeaders: CandidateHeaders = {
  Accept: [
    "application/json",
    "application/x-www-form-urlencoded",
    "multipart/form-data",
  ],
  "Accept-Encoding": ["gzip, deflate, br"],
  "Accept-Language": ["zh-CN,zh;q=0.9,en;q=0.8"],
  "Access-Control-Allow-Credentials": ["true", "false"],
  "Access-Control-Allow-Headers": ["Content-Type,Access-Token", "*"],
  "Access-Control-Allow-Methods": ["GET, POST, OPTIONS"],
  "Access-Control-Allow-Origin": ["*"],
  "Access-Control-Expose-Headers": ["*"],
  "Access-Control-Max-Age": ["3600"],
  "Access-Token": ["access_token"],
  "Cache-Control": ["no-cache"],
  Connection: ["keep-alive"],
  Cookie: ["JSESSIONID=1F4C8F4B0B8D0A6A2F7E5B5C3A0C2F4D"],
  "Content-Length": ["0"],
  "Content-Security-Policy": ["upgrade-insecure-requests"],
  "Content-Type": [
    "application/json;charset=UTF-8",
    "application/x-www-form-urlencoded;charset=UTF-8",
    "multipart/form-data;charset=UTF-8",
    "text/plain;charset=UTF-8",
    "application/json",
    "application/x-www-form-urlencoded",
    "multipart/form-data",
    "text/plain",
  ],
  "Content-TRANSFER-ENCODING": ["binary"],
  Host: ["halo.p1n.top"],
  Pragma: ["no-cache"],
  Referer: ["https://halo.p1n.top/"],
  "Sec-Fetch-Dest": ["empty"],
  "Sec-Fetch-Mode": ["cors"],
  "Sec-Fetch-Site": ["same-origin"],
  "User-Agent": [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/92.0.4515.159 Safari/537.36",
  ],
  "X-Requested-With": ["XMLHttpRequest"],
  "X-Forwarded-For": [],
  "X-Forwarded-Host": [],
  "X-Forwarded-Port": [],
  "X-Forwarded-Proto": [],
  "X-Forwarded-Server": [],
  "X-Real-IP": [],
  "X-Request-ID": [],
  "X-Request-Start": [],
  "X-Total-Count": [],
  "X-Total-Pages": [],
  "X-Total-Rows": [],
  "X-Total-Size": [],
  "X-Total-Elements": [],
  "Upgrade-Insecure-Requests": ["1"],
  Origin: ["https://halo.p1n.top"],
  "If-Modified-Since": ["Thu, 01 Jan 1970 00:00:00 GMT"],
  "If-None-Match": ['W/"2a-17b0a0f2f00"'],
};

export const commonRequestHeaderUsage = {
  "content-type":
    "用于指示发送的数据的类型或格式。它告诉服务器如何解析请求体中的数据，以便正确处理请求。通常，当客户端（浏览器或其他应用程序）发送 HTTP 请求时，会包含 Content-Type 请求头来描述请求中所包含数据的媒体类型。",
  accept:
    "用于指定客户端期望接收的响应内容的类型。当客户端发送请求时，可以使用 Accept 请求头来告知服务器它可以接受的响应内容类型，服务器可以据此进行内容协商，返回客户端支持的响应类型。",
  authorization:
    "用于将认证凭证传递给服务器，以便对请求进行身份验证。通常，Authorization 请求头用于发送身份验证令牌（例如，Bearer Token），让服务器验证客户端是否有权限访问受保护的资源。",
  "user-agent":
    "用于标识发起 HTTP 请求的客户端应用程序或浏览器。User-Agent 请求头可以帮助服务器识别请求的来源设备或应用程序，并据此适应性地返回响应。",
  cookie:
    "用于在客户端和服务器之间传递保存在客户端的HTTP Cookie。通过 Cookie 请求头，客户端可以将之前服务器发送的 Cookie 数据传递回服务器，服务器可以据此识别用户的会话状态和其他相关信息。",
  referer:
    "指示了当前请求的来源页面 URL。Referer 请求头可以告知服务器请求是从哪个页面链接过来的，有助于服务器跟踪请求的来源。",
  origin:
    "用于标识一个 HTML 页面的源信息。Origin 请求头通常用于跨源请求（跨域请求）中，用来告知服务器请求的源自哪个网页或站点，对于某些跨域请求，服务器可以据此决定是否允许请求。",
  host: "用于指示服务器要请求的主机名（域名），在HTTP/1.1协议中，每个请求都需要包含 Host 请求头，以便服务器知道客户端想要访问哪个域名下的资源。",
  "content-length":
    "用于指示发送的请求体数据的长度（以字节为单位）。Content-Length 请求头告诉服务器请求体的大小，使得服务器能够正确读取和处理请求体数据。",
  "cache-control":
    "用于控制缓存的行为。Cache-Control 请求头可以指示客户端或代理服务器如何缓存响应内容，例如指示缓存时长、是否使用缓存等信息。",
  connection:
    "用于指示是否要保持持久连接。Connection 请求头可以控制 HTTP 连接的行为，例如是否保持持久连接或者在请求后断开连接。",
  "if-modified-since":
    "用于缓存控制和条件请求。If-Modified-Since 请求头可以告诉服务器只有在指定日期后修改过的资源才会被返回，用于在服务器认为资源未修改时返回 304 Not Modified 状态码。",
  "if-none-match":
    "用于缓存控制和条件请求。If-None-Match 请求头可以包含之前响应中 ETag 标识符，告诉服务器只有在 ETag 不匹配时才返回响应内容，用于避免重复获取未修改的资源。",
  "accept-language":
    "用于指定客户端接受的语言类型。Accept-Language 请求头可以告知服务器客户端接受的首选语言，服务器据此返回最适合的语言版本的响应内容。",
  "accept-encoding":
    "用于指定客户端接受的内容编码方式。Accept-Encoding 请求头可以告知服务器客户端可以接受的内容压缩编码方式，以便服务器返回经过压缩的响应内容。",
  date: "用于指示发送请求的日期和时间。Date 请求头包含了请求发送的日期和时间信息，有助于服务器进行时间相关的处理和验证。",
  "content-disposition":
    "用于指示响应内容该以什么形式展示给用户，通常与文件下载相关。Content-Disposition 请求头可以指示浏览器如何处理响应内容，例如作为附件下载或内联显示。",
  "x-frame-options":
    "用于防止页面被嵌入到 iframe 中，以防止点击劫持等安全问题。X-Frame-Options 请求头可以告知浏览器是否允许将页面嵌入到 iframe 中，从而保护网页内容安全。",
  "x-xss-protection":
    "用于防止跨站脚本攻击（XSS）。X-XSS-Protection 请求头告诉浏览器是否启用内置的跨站脚本（XSS）过滤器，以保护用户免受恶意脚本的攻击。",
  "x-content-type-options":
    "用于控制浏览器 MIME 类型嗅探行为。X-Content-Type-Options 请求头可以告知浏览器是否允许进行 MIME 类型嗅探，避免浏览器根据内容类型进行不必要的解释。",
  etag: "用于标识资源的版本号，通常用于缓存控制。ETag 请求头可以表示资源的版本标识符，服务器通过比较 ETag 可以判断资源是否已经发生改变。",
  "last-modified":
    "用于指示资源的最后修改时间。Last-Modified 请求头包含了资源的最后修改时间，可供服务器进行条件请求的比较，判断资源是否需要更新。",
  "upgrade-insecure-requests":
    "用于提示浏览器升级到 HTTPS 的安全连接。Upgrade-Insecure-Requests 请求头可以告知服务器客户端希望获取的资源应该通过 HTTPS 进行加载，以提升安全性。",
  dnt: "用于告知服务器用户不希望被跟踪。DNT（Do Not Track）请求头是用户向服务器传递的信号，表明用户不希望被追踪其在线行为，但服务器是否遵守这一信号由服务器自行决定。",
  "proxy-authorization":
    "用于在代理服务器进行身份验证。Proxy-Authorization 请求头用于传递给代理服务器的身份验证信息，以便客户端能够访问受保护的资源。",
  "x-forwarded-for":
    "用于标识 HTTP 请求的原始客户端 IP 地址。X-Forwarded-For 请求头用于在代理服务器后面识别客户端的原始 IP 地址，对于代理服务器的请求转发和识别很有用。",
  "x-requested-with":
    "用于指示请求的来源。X-Requested-With 请求头通常与 Ajax 请求相关，用于指示请求是由普通页面请求发起，还是由 JavaScript 发起的异步请求。",
  range:
    "用于指定请求的部分内容。Range 请求头用于实现断点续传和范围请求，告诉服务器只返回资源的特定部分，而非整个资源内容。",
  "if-range":
    "用于在条件范围请求中进行比较判断。If-Range 请求头用于指定条件请求的范围，如果资源未发生变化，则返回资源；如果资源已发生变化，则返回整个资源。",
  "if-unmodified-since":
    "用于条件请求中的资源未修改比较。If-Unmodified-Since 请求头告诉服务器，只有在资源在指定日期后未被修改时才返回响应内容。",
  te: "用于指示传输编码的意愿和能力。TE 请求头通常用于 HTTP/1.1 中，告知服务器客户端对传输编码的偏好，比如是否支持分块传输编码。",
  expect:
    "用于控制服务器对请求的处理。Expect 请求头用于告知服务器客户端期望的服务行为，比如期望服务器返回 100 Continue 状态码。",
  forwarded:
    "用于跟踪 HTTP 请求的转发信息。Forwarded 请求头包含了请求经过的代理服务器相关信息，有助于在多层代理情况下跟踪请求的路径。",
  "if-match":
    "用于缓存控制和条件请求。If-Match 请求头包含了资源的 ETag 值，告知服务器只有当资源的 ETag 值匹配时才返回响应内容。",
  "max-forwards":
    "用于跟踪 HTTP 请求的最大传递次数。Max-Forwards 请求头用于追踪请求经过的最大服务器跳数，每经过一个服务器 Max-Forwards 的值减一。",
  via: "用于标识 HTTP 请求经过的代理服务器。Via 请求头可以包含了请求经过的代理服务器信息，从而告知服务器请求的路径和经过的中间服务器。",
  warning:
    "用于包含关于消息的警告信息。Warning 请求头包含了与消息相关的警告信息，告知客户端或代理服务器有关与响应相关的一些警告信息。",
  "x-csrf-token":
    "用于防止跨站请求伪造攻击（CSRF）。X-Csrf-Token 请求头通常用于发送 CSRF 令牌，以便服务器验证请求的合法性。",
  "x-content-security-policy":
    "用于设置浏览器内容安全策略。X-Content-Security-Policy 请求头可以告知浏览器应用哪些安全策略，保护页面免受特定类型的攻击。",
  "x-forwarded-proto":
    "用于识别原始请求协议。X-Forwarded-Proto 请求头可以告知服务器请求的原始协议，对于一些反向代理服务器有助于进行适当的协议处理。",
  "x-permitted-cross-domain-policies":
    "用于设置跨域策略。X-Permitted-Cross-Domain-Policies 请求头用于指定其他域名或服务器是否允许加载本域名的资源，有助于控制跨域资源的加载。",
  "x-powered-by":
    "用于标识服务器所用技术或框架。X-Powered-By 请求头通常包含服务器所使用的技术或框架信息，有些情况下可能会成为潜在的安全风险。",
  "x-request-id":
    "用于标识请求的唯一标识符。X-Request-ID 请求头通常包含了对请求的唯一标识符，有助于在服务间跟踪和识别请求。",
  "x-robots-tag":
    "用于控制搜索引擎的索引行为。X-Robots-Tag 请求头可以告知搜索引擎是否允许索引某个页面或某些资源。",
  "x-ua-compatible":
    "用于指示浏览器使用何种版本渲染页面。X-UA-Compatible 请求头用于告知浏览器以何种版本进行页面渲染，有助于保持向后兼容性。",
  "x-upload-content-length":
    "用于指示上传内容的大小。X-Upload-Content-Length 请求头通常在大文件上传时使用，用于指示上传内容的大小。",
  "x-upload-content-type":
    "用于指示上传内容的类型。X-Upload-Content-Type 请求头通常在大文件上传时使用，用于指示上传内容的类型。",
  "x-real-ip":
    "用于识别客户端的真实 IP 地址。X-Real-IP 请求头可以告知服务器请求的真实客户端 IP 地址，对于一些代理服务器非常有用。",
};

/**
 * 合并两个候选请求头
 * @param source
 * @param target
 */
export function mergeCandidateHeaders(
  target: CandidateHeaders,
  source?: CandidateHeaders,
) {
  if (!source) {
    return target;
  }
  Object.keys(source).forEach((key) => {
    // 允许覆盖
    if (!target[key]) {
      target[key] = source[key];
    } else {
      target[key] = target[key].concat(source[key]);
    }
  });
  return target;
}
/**
 * 计算两个字符串之间的编辑距离
 * @param a 字符串a
 * @param b 字符串b
 */
export function levenshteinDistance(a: string, b: string) {
  const distanceMatrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) {
    distanceMatrix[0][i] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    distanceMatrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      distanceMatrix[j][i] = Math.min(
        distanceMatrix[j][i - 1] + 1,
        distanceMatrix[j - 1][i] + 1,
        distanceMatrix[j - 1][i - 1] + indicator,
      );
    }
  }

  return distanceMatrix[b.length][a.length];
}
