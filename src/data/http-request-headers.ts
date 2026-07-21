export type RequestHeaderCategory =
  | 'negotiation'
  | 'authentication'
  | 'content'
  | 'conditional'
  | 'connection'
  | 'cors'
  | 'client'
  | 'proxy'
  | 'websocket'
  | 'tracing';

export interface RequestHeaderReference {
  name: string;
  category: RequestHeaderCategory;
  purposeEn: string;
  purposeZh: string;
  syntax: string;
  example: string;
  deprecated?: boolean;
  nonStandard?: boolean;
  keywords?: string;
}

type HeaderOptions = Pick<RequestHeaderReference, 'deprecated' | 'nonStandard' | 'keywords'>;

const header = (
  name: string,
  category: RequestHeaderCategory,
  purposeEn: string,
  purposeZh: string,
  syntax: string,
  example: string,
  options: HeaderOptions = {},
): RequestHeaderReference => ({ name, category, purposeEn, purposeZh, syntax, example, ...options });

export const requestHeaderCategories: RequestHeaderCategory[] = [
  'negotiation',
  'authentication',
  'content',
  'conditional',
  'connection',
  'cors',
  'client',
  'proxy',
  'websocket',
  'tracing',
];

export const httpRequestHeaders: RequestHeaderReference[] = [
  header('Accept', 'negotiation', 'Lists the media types the client can understand.', '声明客户端能够处理的媒体类型。', 'Accept: <media-type>[/<subtype>] [;q=<weight>], …', 'Accept: text/html, application/json;q=0.9, */*;q=0.8', { keywords: '内容协商 media mime 响应格式' }),
  header('Accept-Charset', 'negotiation', 'Lists acceptable character encodings.', '声明客户端可接受的字符编码。', 'Accept-Charset: <charset> [;q=<weight>], …', 'Accept-Charset: utf-8, iso-8859-1;q=0.5', { deprecated: true, keywords: '字符集 编码 character set' }),
  header('Accept-Encoding', 'negotiation', 'Lists acceptable response compression algorithms.', '声明可接受的响应压缩算法。', 'Accept-Encoding: <encoding> [;q=<weight>], …', 'Accept-Encoding: gzip, br, zstd', { keywords: '压缩 gzip brotli zstd compression' }),
  header('Accept-Language', 'negotiation', 'Lists the client’s preferred natural languages.', '声明客户端偏好的自然语言。', 'Accept-Language: <language-tag> [;q=<weight>], …', 'Accept-Language: zh-CN, zh;q=0.9, en;q=0.8', { keywords: '语言 本地化 locale i18n' }),
  header('TE', 'negotiation', 'Specifies acceptable transfer codings and trailer support.', '指定可接受的传输编码以及是否支持尾部字段。', 'TE: trailers | <transfer-coding> [;q=<weight>], …', 'TE: trailers', { keywords: '传输编码 trailers chunked' }),
  header('A-IM', 'negotiation', 'Lists acceptable instance-manipulation algorithms for delta encoding.', '声明可接受的实例操作算法，用于增量编码。', 'A-IM: <instance-manipulation> [;q=<weight>], …', 'A-IM: diffe, gzip', { keywords: '增量编码 delta encoding instance manipulation' }),
  header('Accept-Datetime', 'negotiation', 'Requests a past representation of a resource from a Memento server.', '向支持 Memento 的服务器请求资源在过去某一时间的表示。', 'Accept-Datetime: <http-date>', 'Accept-Datetime: Thu, 31 May 2007 20:35:00 GMT', { keywords: 'memento 时间协商 历史版本 datetime' }),
  header('Prefer', 'negotiation', 'Expresses optional client preferences for how the server handles a request.', '表达客户端希望服务器如何处理请求的可选偏好。', 'Prefer: <preference>[=<value>][; <parameter>], …', 'Prefer: return=minimal, respond-async', { keywords: '偏好 minimal representation async rfc7240' }),
  header('Priority', 'negotiation', 'Communicates HTTP request urgency and incremental-processing preference.', '传递 HTTP 请求的紧急程度和增量处理偏好。', 'Priority: u=<0-7>[, i]', 'Priority: u=1, i', { keywords: '优先级 urgency incremental http2 http3 rfc9218' }),

  header('Authorization', 'authentication', 'Carries credentials used to authenticate with the origin server.', '携带用于向源服务器验证身份的凭据。', 'Authorization: <auth-scheme> <credentials>', 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9…', { keywords: '认证 凭证 bearer basic token jwt 登录' }),
  header('Proxy-Authorization', 'authentication', 'Carries credentials for an authenticating proxy.', '携带用于代理服务器身份验证的凭据。', 'Proxy-Authorization: <auth-scheme> <credentials>', 'Proxy-Authorization: Basic dXNlcjpwYXNz', { keywords: '代理认证 proxy credentials' }),
  header('Cookie', 'authentication', 'Sends stored cookies to the server.', '将浏览器保存的 Cookie 发送给服务器。', 'Cookie: <name>=<value>; <name>=<value>', 'Cookie: session=abc123; theme=dark', { keywords: '会话 session 登录 状态' }),
  header('DPoP', 'authentication', 'Carries a proof-of-possession JWT bound to an OAuth access token.', '携带与 OAuth 访问令牌绑定的持有证明 JWT。', 'DPoP: <signed-jwt>', 'DPoP: eyJ0eXAiOiJkcG9wK2p3dCIsImFsZyI6IkVTMjU2In0…', { keywords: 'oauth jwt 持有证明 proof of possession token rfc9449' }),
  header('X-API-Key', 'authentication', 'Carries an API key using a common application convention.', '按照常见应用约定携带 API 密钥。', 'X-API-Key: <api-key>', 'X-API-Key: sk_live_51Example', { nonStandard: true, keywords: '接口密钥 api key authentication token' }),
  header('X-CSRF-Token', 'authentication', 'Carries an application-defined token that helps prevent CSRF attacks.', '携带应用定义的令牌以帮助防止 CSRF 攻击。', 'X-CSRF-Token: <token>', 'X-CSRF-Token: 9f9c0d4a61b84f22', { nonStandard: true, keywords: '跨站请求伪造 csrf xsrf security token' }),
  header('X-XSRF-TOKEN', 'authentication', 'Carries an anti-CSRF token under a framework-specific convention.', '按照部分框架的约定携带防 CSRF 令牌。', 'X-XSRF-TOKEN: <token>', 'X-XSRF-TOKEN: eyJpdiI6IkV4YW1wbGUifQ==', { nonStandard: true, keywords: 'angular laravel 跨站请求伪造 csrf xsrf token' }),

  header('Content-Type', 'content', 'Describes the media type of the request body.', '描述请求正文的媒体类型。', 'Content-Type: <media-type> [; charset=<charset>] [; boundary=<boundary>]', 'Content-Type: application/json; charset=utf-8', { keywords: '正文类型 mime body json form 表单' }),
  header('Content-Length', 'content', 'Gives the request body size in bytes.', '给出请求正文的字节长度。', 'Content-Length: <decimal-number>', 'Content-Length: 348', { keywords: '正文长度 字节 body size' }),
  header('Content-Encoding', 'content', 'Lists encodings applied to the request body.', '列出应用于请求正文的编码或压缩方式。', 'Content-Encoding: <encoding>, …', 'Content-Encoding: gzip', { keywords: '正文压缩 body compression gzip' }),
  header('Content-Language', 'content', 'Describes the intended language of the request body.', '描述请求正文面向的语言。', 'Content-Language: <language-tag>, …', 'Content-Language: zh-CN', { keywords: '正文语言 body locale' }),
  header('Content-Location', 'content', 'Provides a URI for the specific representation in the body.', '提供正文中具体表示形式对应的 URI。', 'Content-Location: <url>', 'Content-Location: /documents/report.zh-CN.html', { keywords: '内容位置 uri representation' }),
  header('Content-Disposition', 'content', 'Describes how multipart form content should be handled.', '描述多部分表单中内容的名称和文件名等处理方式。', 'Content-Disposition: form-data; name="<field>"[; filename="<file>"]', 'Content-Disposition: form-data; name="avatar"; filename="me.png"', { keywords: '上传 文件 multipart form-data upload filename' }),
  header('Digest', 'content', 'Supplies a digest of the selected representation.', '提供所选表示形式的内容摘要。', 'Digest: <algorithm>=<digest-value>', 'Digest: sha-256=X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=', { deprecated: true, keywords: '摘要 哈希 hash integrity' }),
  header('Want-Digest', 'content', 'Requests that the server provide a content digest.', '请求服务器提供内容摘要。', 'Want-Digest: <algorithm> [;q=<weight>], …', 'Want-Digest: sha-256=1, sha-512=0.5', { deprecated: true, keywords: '摘要 哈希 hash integrity' }),
  header('Content-Digest', 'content', 'Provides a digest of the encoded HTTP message content.', '提供经过内容编码后的 HTTP 消息内容摘要。', 'Content-Digest: <algorithm>=:<base64-digest>:', 'Content-Digest: sha-256=:X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=:', { keywords: '内容摘要 完整性 hash integrity rfc9530' }),
  header('Repr-Digest', 'content', 'Provides a digest of the selected representation before content encoding.', '提供应用内容编码前所选表示形式的摘要。', 'Repr-Digest: <algorithm>=:<base64-digest>:', 'Repr-Digest: sha-256=:X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=:', { keywords: '表示摘要 完整性 hash integrity rfc9530' }),
  header('Want-Content-Digest', 'content', 'Requests a Content-Digest field using preferred algorithms.', '请求服务器使用指定的首选算法返回 Content-Digest。', 'Want-Content-Digest: <algorithm>=<preference>, …', 'Want-Content-Digest: sha-512=3, sha-256=10', { keywords: '内容摘要 完整性 preference rfc9530' }),
  header('Want-Repr-Digest', 'content', 'Requests a Repr-Digest field using preferred algorithms.', '请求服务器使用指定的首选算法返回 Repr-Digest。', 'Want-Repr-Digest: <algorithm>=<preference>, …', 'Want-Repr-Digest: sha-256=10', { keywords: '表示摘要 完整性 preference rfc9530' }),
  header('Content-MD5', 'content', 'Provides a legacy MD5 digest of the message content.', '提供旧式的消息内容 MD5 摘要。', 'Content-MD5: <base64-md5-digest>', 'Content-MD5: Q2hlY2sgSW50ZWdyaXR5IQ==', { deprecated: true, keywords: '旧式摘要 md5 integrity rfc1864' }),

  header('Cache-Control', 'conditional', 'Specifies request caching directives.', '指定请求端的缓存指令。', 'Cache-Control: <directive>[=<value>], …', 'Cache-Control: no-cache, max-age=0', { keywords: '缓存 cache no-cache max-age' }),
  header('Pragma', 'conditional', 'Provides the legacy HTTP/1.0 no-cache directive.', '提供兼容 HTTP/1.0 的旧式不缓存指令。', 'Pragma: no-cache', 'Pragma: no-cache', { deprecated: true, keywords: '缓存 兼容 http1.0 cache' }),
  header('If-Match', 'conditional', 'Makes the request conditional on a matching ETag.', '仅当资源的 ETag 匹配时执行请求。', 'If-Match: <etag>, … | *', 'If-Match: "67ab43"', { keywords: '条件请求 etag 乐观锁 concurrency' }),
  header('If-None-Match', 'conditional', 'Makes the request conditional on no current ETag matching.', '仅当当前 ETag 均不匹配时执行请求。', 'If-None-Match: <etag>, … | *', 'If-None-Match: "67ab43"', { keywords: '条件请求 etag 缓存 304 cache' }),
  header('If-Modified-Since', 'conditional', 'Requests the resource only if it changed after a date.', '仅在资源晚于指定时间发生修改时请求资源。', 'If-Modified-Since: <http-date>', 'If-Modified-Since: Wed, 21 Oct 2015 07:28:00 GMT', { keywords: '条件请求 修改时间 缓存 304 date' }),
  header('If-Unmodified-Since', 'conditional', 'Proceeds only if the resource has not changed since a date.', '仅在资源自指定时间后未发生修改时执行请求。', 'If-Unmodified-Since: <http-date>', 'If-Unmodified-Since: Wed, 21 Oct 2015 07:28:00 GMT', { keywords: '条件请求 修改时间 并发 date' }),
  header('If-Range', 'conditional', 'Requests a range only if the validator still matches.', '仅当验证器仍匹配时请求指定范围，否则获取完整资源。', 'If-Range: <etag> | <http-date>', 'If-Range: "67ab43"', { keywords: '断点续传 range etag date' }),
  header('Range', 'conditional', 'Requests one or more byte ranges of a resource.', '请求资源的一个或多个字节范围。', 'Range: <range-unit>=<range-start>-<range-end>, …', 'Range: bytes=0-1023', { keywords: '范围请求 分段下载 断点续传 partial download' }),

  header('Host', 'connection', 'Identifies the target host and optional port.', '标识请求的目标主机和可选端口。', 'Host: <host>[:<port>]', 'Host: api.example.com:8443', { keywords: '主机 域名 端口 authority virtual host' }),
  header('Connection', 'connection', 'Controls whether the network connection stays open.', '控制当前网络连接是否保持打开。', 'Connection: keep-alive | close', 'Connection: keep-alive', { keywords: '连接 保活 close hop-by-hop' }),
  header('Keep-Alive', 'connection', 'Suggests timeout and request limits for a persistent connection.', '建议持久连接的超时时间和最大请求数。', 'Keep-Alive: timeout=<seconds>, max=<requests>', 'Keep-Alive: timeout=5, max=1000', { nonStandard: true, keywords: '连接保活 persistent timeout' }),
  header('Upgrade', 'connection', 'Asks to switch the current connection to another protocol.', '请求将当前连接切换到另一种协议。', 'Upgrade: <protocol>[/<version>], …', 'Upgrade: websocket', { keywords: '协议升级 websocket h2c' }),
  header('Expect', 'connection', 'States expectations the server must meet before the body is sent.', '声明服务器在发送正文前需要满足的条件。', 'Expect: 100-continue', 'Expect: 100-continue', { keywords: '继续 上传 body 100 continue' }),
  header('Max-Forwards', 'connection', 'Limits how many proxies may forward TRACE or OPTIONS.', '限制 TRACE 或 OPTIONS 请求可经过的代理数量。', 'Max-Forwards: <integer>', 'Max-Forwards: 10', { keywords: '代理 跳数 trace options hops' }),
  header('Via', 'connection', 'Records proxies and protocol versions traversed by the request.', '记录请求经过的代理和协议版本。', 'Via: <protocol-name>/<protocol-version> <received-by>, …', 'Via: 1.1 proxy.example.com', { keywords: '代理 网关 路径 gateway' }),
  header('Trailer', 'connection', 'Lists fields that will be sent in the trailer section.', '列出将在分块消息尾部发送的字段。', 'Trailer: <field-name>, …', 'Trailer: Digest', { keywords: '尾部字段 chunked trailer' }),
  header(':method', 'connection', 'Carries the HTTP method as an HTTP/2 or HTTP/3 pseudo-header.', '在 HTTP/2 或 HTTP/3 中以伪头形式携带请求方法。', ':method: <method>', ':method: POST', { keywords: '伪头 pseudo header http2 http3 method 请求方法' }),
  header(':scheme', 'connection', 'Carries the target URI scheme as an HTTP/2 or HTTP/3 pseudo-header.', '在 HTTP/2 或 HTTP/3 中以伪头形式携带目标 URI 协议。', ':scheme: <scheme>', ':scheme: https', { keywords: '伪头 pseudo header http2 http3 scheme 协议' }),
  header(':authority', 'connection', 'Carries the target URI authority as an HTTP/2 or HTTP/3 pseudo-header.', '在 HTTP/2 或 HTTP/3 中以伪头形式携带目标 URI 权威部分。', ':authority: <host>[:<port>]', ':authority: api.example.com', { keywords: '伪头 pseudo header http2 http3 host 主机' }),
  header(':path', 'connection', 'Carries the target path and query as an HTTP/2 or HTTP/3 pseudo-header.', '在 HTTP/2 或 HTTP/3 中以伪头形式携带目标路径和查询参数。', ':path: <path>[?<query>]', ':path: /users?page=2', { keywords: '伪头 pseudo header http2 http3 path query 路径' }),
  header(':protocol', 'connection', 'Carries the protocol for an extended CONNECT request.', '在扩展 CONNECT 请求中携带目标协议。', ':protocol: <protocol>', ':protocol: websocket', { keywords: '伪头 pseudo header extended connect websocket http2 http3' }),
  header('HTTP2-Settings', 'connection', 'Carries an HTTP/2 SETTINGS payload during an h2c upgrade.', '在 h2c 升级过程中携带 HTTP/2 SETTINGS 载荷。', 'HTTP2-Settings: <base64url-settings-payload>', 'HTTP2-Settings: AAMAAABkAAQAAP__', { keywords: 'http2 h2c 升级 settings rfc7540' }),
  header('Proxy-Connection', 'connection', 'Controls a proxy connection in some legacy clients and proxies.', '在部分旧式客户端和代理中控制代理连接。', 'Proxy-Connection: keep-alive | close', 'Proxy-Connection: keep-alive', { nonStandard: true, deprecated: true, keywords: '代理连接 旧式 keep alive legacy' }),

  header('Origin', 'cors', 'Identifies the origin that initiated a CORS or POST request.', '标识发起 CORS 或 POST 请求的源。', 'Origin: <scheme>://<host>[:<port>] | null', 'Origin: https://app.example.com', { keywords: '跨域 cors 来源 安全 scheme host' }),
  header('Access-Control-Request-Method', 'cors', 'Names the method intended for a CORS preflight request.', '在 CORS 预检请求中声明实际请求将使用的方法。', 'Access-Control-Request-Method: <method>', 'Access-Control-Request-Method: PATCH', { keywords: '跨域 预检 preflight method' }),
  header('Access-Control-Request-Headers', 'cors', 'Lists headers intended for a CORS preflighted request.', '在 CORS 预检请求中列出实际请求将携带的头。', 'Access-Control-Request-Headers: <field-name>, …', 'Access-Control-Request-Headers: authorization, content-type', { keywords: '跨域 预检 preflight headers' }),
  header('Sec-Fetch-Dest', 'cors', 'Describes the request destination, such as document or image.', '描述请求目标类型，例如文档、图片或脚本。', 'Sec-Fetch-Dest: <destination>', 'Sec-Fetch-Dest: document', { keywords: '获取元数据 fetch metadata 目标 安全' }),
  header('Sec-Fetch-Mode', 'cors', 'Describes the request mode.', '描述请求模式。', 'Sec-Fetch-Mode: cors | navigate | no-cors | same-origin | websocket', 'Sec-Fetch-Mode: cors', { keywords: '获取元数据 fetch metadata 模式 安全' }),
  header('Sec-Fetch-Site', 'cors', 'Describes the relationship between initiator and target origins.', '描述请求发起方与目标源之间的站点关系。', 'Sec-Fetch-Site: cross-site | same-origin | same-site | none', 'Sec-Fetch-Site: same-origin', { keywords: '获取元数据 fetch metadata 跨站 csrf 安全' }),
  header('Sec-Fetch-User', 'cors', 'Indicates that a navigation was triggered by user activation.', '表示导航请求由用户操作触发。', 'Sec-Fetch-User: ?1', 'Sec-Fetch-User: ?1', { keywords: '获取元数据 fetch metadata 用户激活 navigate' }),
  header('Sec-Purpose', 'cors', 'Indicates the browser’s purpose for fetching the resource.', '指示浏览器获取资源的用途。', 'Sec-Purpose: <purpose>', 'Sec-Purpose: prefetch', { keywords: '预取 prerender fetch purpose' }),
  header('Access-Control-Request-Private-Network', 'cors', 'Asks permission to access a more-private network during CORS preflight.', '在 CORS 预检中请求访问更私有网络的权限。', 'Access-Control-Request-Private-Network: true', 'Access-Control-Request-Private-Network: true', { nonStandard: true, keywords: '私有网络访问 pna cors 预检 preflight local network' }),
  header('Sec-Fetch-Storage-Access', 'cors', 'Indicates whether the request has storage-access permission.', '指示请求是否具有存储访问权限。', 'Sec-Fetch-Storage-Access: active | inactive | none', 'Sec-Fetch-Storage-Access: active', { keywords: 'fetch metadata storage access cookie privacy' }),
  header('Upgrade-Insecure-Requests', 'cors', 'Signals a preference for encrypted and authenticated responses.', '表示客户端偏好加密且经过身份验证的响应。', 'Upgrade-Insecure-Requests: 1', 'Upgrade-Insecure-Requests: 1', { keywords: 'https csp 混合内容 安全 upgrade insecure' }),

  header('User-Agent', 'client', 'Identifies the requesting application and platform.', '标识发起请求的应用程序及其运行平台。', 'User-Agent: <product>/<version> (<comment>) …', 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', { keywords: '浏览器 客户端 设备 browser client ua' }),
  header('Referer', 'client', 'Contains the address of the page that initiated the request.', '包含发起当前请求的页面地址。', 'Referer: <absolute-or-partial-url>', 'Referer: https://example.com/account', { keywords: '来源页面 引用 referrer analytics' }),
  header('From', 'client', 'Provides a contact email for the human controlling the client.', '提供控制该客户端的用户联系邮箱。', 'From: <email-address>', 'From: webmaster@example.com', { keywords: '联系人 邮箱 email contact' }),
  header('DNT', 'client', 'Expresses the legacy Do Not Track preference.', '表达旧式“请勿跟踪”偏好。', 'DNT: 0 | 1', 'DNT: 1', { deprecated: true, nonStandard: true, keywords: '隐私 请勿跟踪 privacy do not track' }),
  header('Sec-GPC', 'client', 'Expresses the Global Privacy Control preference.', '表达“全球隐私控制”偏好。', 'Sec-GPC: 1', 'Sec-GPC: 1', { keywords: '隐私 全球隐私控制 privacy global' }),
  header('Save-Data', 'client', 'Requests reduced data usage from the server.', '请求服务器尽量减少数据传输量。', 'Save-Data: on', 'Save-Data: on', { keywords: '流量节省 省流 data saver client hint' }),
  header('Sec-CH-UA', 'client', 'Provides browser brand and major-version client hints.', '提供浏览器品牌及主要版本的客户端提示。', 'Sec-CH-UA: <brand-version-list>', 'Sec-CH-UA: "Chromium";v="150", "Not=A?Brand";v="24"', { keywords: '客户端提示 浏览器 品牌 client hints browser' }),
  header('Sec-CH-UA-Mobile', 'client', 'Indicates whether the browser prefers a mobile experience.', '指示浏览器是否偏好移动端体验。', 'Sec-CH-UA-Mobile: ?0 | ?1', 'Sec-CH-UA-Mobile: ?0', { keywords: '客户端提示 移动设备 mobile client hints' }),
  header('Sec-CH-UA-Platform', 'client', 'Provides the client operating-system platform.', '提供客户端操作系统平台。', 'Sec-CH-UA-Platform: <platform>', 'Sec-CH-UA-Platform: "Linux"', { keywords: '客户端提示 操作系统 os platform client hints' }),
  header('DPR', 'client', 'Reports the device pixel ratio as a client hint.', '以客户端提示形式报告设备像素比。', 'DPR: <number>', 'DPR: 2', { deprecated: true, keywords: '客户端提示 像素比 retina client hints' }),
  header('Width', 'client', 'Reports the desired resource width in physical pixels.', '报告资源所需的物理像素宽度。', 'Width: <number>', 'Width: 800', { deprecated: true, keywords: '客户端提示 图片宽度 responsive image' }),
  header('Viewport-Width', 'client', 'Reports the layout viewport width in CSS pixels.', '报告布局视口的 CSS 像素宽度。', 'Viewport-Width: <number>', 'Viewport-Width: 1440', { deprecated: true, keywords: '客户端提示 视口宽度 responsive' }),
  header('Device-Memory', 'client', 'Reports approximate device RAM in GiB.', '报告设备内存的大致 GiB 数。', 'Device-Memory: <number>', 'Device-Memory: 8', { keywords: '客户端提示 内存 ram performance' }),
  header('Downlink', 'client', 'Reports approximate downstream speed in Mbps.', '报告大致下行网络速度（Mbps）。', 'Downlink: <number>', 'Downlink: 10', { keywords: '客户端提示 网速 bandwidth network information' }),
  header('ECT', 'client', 'Reports the effective connection type.', '报告有效网络连接类型。', 'ECT: slow-2g | 2g | 3g | 4g', 'ECT: 4g', { keywords: '客户端提示 网络类型 effective connection' }),
  header('RTT', 'client', 'Reports approximate application-layer round-trip time.', '报告大致的应用层往返延迟。', 'RTT: <milliseconds>', 'RTT: 75', { keywords: '客户端提示 延迟 latency round trip' }),
  header('Sec-CH-UA-Arch', 'client', 'Reports the CPU architecture as a high-entropy client hint.', '以高熵客户端提示形式报告 CPU 架构。', 'Sec-CH-UA-Arch: <architecture>', 'Sec-CH-UA-Arch: "x86"', { keywords: '客户端提示 cpu 架构 architecture high entropy' }),
  header('Sec-CH-UA-Bitness', 'client', 'Reports the CPU architecture bitness.', '报告 CPU 架构的位数。', 'Sec-CH-UA-Bitness: <bitness>', 'Sec-CH-UA-Bitness: "64"', { keywords: '客户端提示 cpu 位数 32 64 bitness' }),
  header('Sec-CH-UA-Full-Version', 'client', 'Reports the browser’s full version using the legacy single-value hint.', '使用旧式单值提示报告浏览器完整版本。', 'Sec-CH-UA-Full-Version: <version>', 'Sec-CH-UA-Full-Version: "150.0.7339.2"', { deprecated: true, keywords: '客户端提示 浏览器 完整版本 full version' }),
  header('Sec-CH-UA-Full-Version-List', 'client', 'Reports browser brands and their full versions.', '报告浏览器品牌及其完整版本。', 'Sec-CH-UA-Full-Version-List: <brand-version-list>', 'Sec-CH-UA-Full-Version-List: "Chromium";v="150.0.7339.2"', { keywords: '客户端提示 浏览器 品牌 完整版本 high entropy' }),
  header('Sec-CH-UA-Model', 'client', 'Reports the device model.', '报告设备型号。', 'Sec-CH-UA-Model: <model>', 'Sec-CH-UA-Model: "Pixel 10"', { keywords: '客户端提示 设备型号 phone model high entropy' }),
  header('Sec-CH-UA-Platform-Version', 'client', 'Reports the operating-system version.', '报告操作系统版本。', 'Sec-CH-UA-Platform-Version: <version>', 'Sec-CH-UA-Platform-Version: "6.12.0"', { keywords: '客户端提示 操作系统版本 os platform high entropy' }),
  header('Sec-CH-UA-WoW64', 'client', 'Indicates whether a 32-bit browser runs on 64-bit Windows.', '指示 32 位浏览器是否运行在 64 位 Windows 上。', 'Sec-CH-UA-WoW64: ?0 | ?1', 'Sec-CH-UA-WoW64: ?0', { keywords: '客户端提示 windows wow64 32 64 bit' }),
  header('Sec-CH-UA-Form-Factors', 'client', 'Reports the device form factors associated with the browser.', '报告浏览器所在设备的外形类别。', 'Sec-CH-UA-Form-Factors: <form-factor-list>', 'Sec-CH-UA-Form-Factors: "Desktop"', { keywords: '客户端提示 设备类型 desktop mobile tablet form factor' }),
  header('Sec-CH-Prefers-Color-Scheme', 'client', 'Reports the user’s preferred light or dark color scheme.', '报告用户偏好的浅色或深色配色。', 'Sec-CH-Prefers-Color-Scheme: light | dark', 'Sec-CH-Prefers-Color-Scheme: dark', { keywords: '客户端提示 深色模式 dark light color scheme' }),
  header('Sec-CH-Prefers-Reduced-Motion', 'client', 'Reports whether the user prefers reduced animation.', '报告用户是否偏好减少动画。', 'Sec-CH-Prefers-Reduced-Motion: no-preference | reduce', 'Sec-CH-Prefers-Reduced-Motion: reduce', { keywords: '客户端提示 无障碍 减少动画 accessibility motion' }),
  header('Sec-CH-Prefers-Reduced-Transparency', 'client', 'Reports whether the user prefers reduced transparency.', '报告用户是否偏好减少透明效果。', 'Sec-CH-Prefers-Reduced-Transparency: no-preference | reduce', 'Sec-CH-Prefers-Reduced-Transparency: reduce', { keywords: '客户端提示 无障碍 减少透明 accessibility transparency' }),
  header('Sec-CH-Prefers-Contrast', 'client', 'Reports the user’s preferred contrast level.', '报告用户偏好的对比度级别。', 'Sec-CH-Prefers-Contrast: no-preference | more | less | custom', 'Sec-CH-Prefers-Contrast: more', { keywords: '客户端提示 无障碍 对比度 accessibility contrast' }),
  header('Sec-CH-Forced-Colors', 'client', 'Reports whether forced-colors mode is active.', '报告强制颜色模式是否启用。', 'Sec-CH-Forced-Colors: active | none', 'Sec-CH-Forced-Colors: active', { keywords: '客户端提示 无障碍 强制颜色 accessibility forced colors' }),
  header('Sec-CH-Prefers-Reduced-Data', 'client', 'Reports whether the user prefers reduced data usage.', '报告用户是否偏好减少数据使用。', 'Sec-CH-Prefers-Reduced-Data: no-preference | reduce', 'Sec-CH-Prefers-Reduced-Data: reduce', { keywords: '客户端提示 省流量 reduced data privacy' }),
  header('Sec-CH-Device-Memory', 'client', 'Reports approximate device RAM using the Sec-CH client-hint form.', '使用 Sec-CH 客户端提示形式报告设备的大致内存。', 'Sec-CH-Device-Memory: <number>', 'Sec-CH-Device-Memory: 8', { keywords: '客户端提示 内存 ram performance' }),
  header('Sec-CH-DPR', 'client', 'Reports the device pixel ratio using the Sec-CH client-hint form.', '使用 Sec-CH 客户端提示形式报告设备像素比。', 'Sec-CH-DPR: <number>', 'Sec-CH-DPR: 2', { keywords: '客户端提示 像素比 retina responsive image' }),
  header('Sec-CH-Viewport-Width', 'client', 'Reports viewport width using the Sec-CH client-hint form.', '使用 Sec-CH 客户端提示形式报告视口宽度。', 'Sec-CH-Viewport-Width: <number>', 'Sec-CH-Viewport-Width: 1440', { keywords: '客户端提示 视口宽度 responsive viewport' }),
  header('Sec-CH-Width', 'client', 'Reports desired resource width using the Sec-CH client-hint form.', '使用 Sec-CH 客户端提示形式报告资源所需宽度。', 'Sec-CH-Width: <number>', 'Sec-CH-Width: 800', { keywords: '客户端提示 图片宽度 responsive image' }),
  header('Last-Event-ID', 'client', 'Carries the last received Server-Sent Events event ID when reconnecting.', '在重新连接 Server-Sent Events 时携带最后收到的事件 ID。', 'Last-Event-ID: <event-id>', 'Last-Event-ID: event-1842', { keywords: 'sse server sent events 重连 reconnect event stream' }),
  header('Ping-From', 'client', 'Identifies the page that initiated a hyperlink-auditing ping.', '标识发起超链接审计 ping 的页面。', 'Ping-From: <url>', 'Ping-From: https://example.com/article', { nonStandard: true, keywords: '链接审计 hyperlink auditing ping privacy' }),
  header('Ping-To', 'client', 'Identifies the destination of a hyperlink-auditing ping.', '标识超链接审计 ping 的目标地址。', 'Ping-To: <url>', 'Ping-To: https://example.net/target', { nonStandard: true, keywords: '链接审计 hyperlink auditing ping privacy' }),

  header('Forwarded', 'proxy', 'Conveys original client and proxy information in a standardized form.', '以标准格式传递原始客户端及代理信息。', 'Forwarded: by=<identifier>;for=<identifier>;host=<host>;proto=<scheme>', 'Forwarded: for=192.0.2.60;proto=https;host=example.com', { keywords: '反向代理 客户端ip 协议 host reverse proxy' }),
  header('X-Forwarded-For', 'proxy', 'Lists the originating client and proxy IP addresses.', '列出原始客户端及途经代理的 IP 地址。', 'X-Forwarded-For: <client-ip>, <proxy-ip>, …', 'X-Forwarded-For: 203.0.113.42, 192.0.2.10', { nonStandard: true, keywords: '反向代理 真实ip client ip reverse proxy' }),
  header('X-Forwarded-Host', 'proxy', 'Preserves the original Host value seen by a proxy.', '保留代理接收到的原始 Host 值。', 'X-Forwarded-Host: <host>', 'X-Forwarded-Host: www.example.com', { nonStandard: true, keywords: '反向代理 原始域名 host reverse proxy' }),
  header('X-Forwarded-Proto', 'proxy', 'Preserves the original request protocol.', '保留原始请求使用的协议。', 'X-Forwarded-Proto: http | https', 'X-Forwarded-Proto: https', { nonStandard: true, keywords: '反向代理 原始协议 scheme ssl reverse proxy' }),
  header('X-Real-IP', 'proxy', 'Passes an originating client IP through a proxy.', '通过代理传递原始客户端 IP。', 'X-Real-IP: <client-ip>', 'X-Real-IP: 203.0.113.42', { nonStandard: true, keywords: 'nginx 反向代理 真实ip client ip' }),
  header('X-Requested-With', 'proxy', 'Traditionally identifies requests made with JavaScript.', '传统上用于标识由 JavaScript 发起的请求。', 'X-Requested-With: XMLHttpRequest', 'X-Requested-With: XMLHttpRequest', { nonStandard: true, keywords: 'ajax xhr javascript 异步请求' }),
  header('X-Request-ID', 'proxy', 'Carries an application-defined request correlation ID.', '携带由应用定义的请求关联 ID。', 'X-Request-ID: <identifier>', 'X-Request-ID: 7f3c2ad0-b82d-4f80-86f1-a6f21b0ca62f', { nonStandard: true, keywords: '请求id 日志 关联 correlation log' }),
  header('Idempotency-Key', 'proxy', 'Lets a server recognize retries of the same operation.', '帮助服务器识别同一操作的重复重试。', 'Idempotency-Key: <unique-key>', 'Idempotency-Key: 8b95802f-9e9f-4d1c-8f1d-6a44fb74c18e', { keywords: '幂等 重试 支付 retry duplicate' }),
  header('X-Forwarded-Port', 'proxy', 'Preserves the original destination port seen by a proxy.', '保留代理接收到的原始目标端口。', 'X-Forwarded-Port: <port>', 'X-Forwarded-Port: 443', { nonStandard: true, keywords: '反向代理 原始端口 reverse proxy port' }),
  header('X-Forwarded-Ssl', 'proxy', 'Indicates that the original client connection used HTTPS.', '指示原始客户端连接使用了 HTTPS。', 'X-Forwarded-Ssl: on', 'X-Forwarded-Ssl: on', { nonStandard: true, keywords: '反向代理 https ssl tls reverse proxy' }),
  header('Front-End-Https', 'proxy', 'Indicates HTTPS termination at a front-end proxy.', '指示 HTTPS 在前端代理处终止。', 'Front-End-Https: on', 'Front-End-Https: on', { nonStandard: true, keywords: '反向代理 https ssl tls microsoft proxy' }),
  header('X-Original-URL', 'proxy', 'Preserves the original request URL before proxy rewriting.', '保留代理重写前的原始请求 URL。', 'X-Original-URL: <path-and-query>', 'X-Original-URL: /account/settings?tab=security', { nonStandard: true, keywords: '反向代理 原始url rewrite routing' }),
  header('X-Rewrite-URL', 'proxy', 'Communicates a URL rewritten by a proxy or middleware.', '传递由代理或中间件重写的 URL。', 'X-Rewrite-URL: <path-and-query>', 'X-Rewrite-URL: /internal/account/42', { nonStandard: true, keywords: '反向代理 url重写 middleware routing' }),
  header('True-Client-IP', 'proxy', 'Carries the originating client IP in some CDN deployments.', '在部分 CDN 环境中携带原始客户端 IP。', 'True-Client-IP: <client-ip>', 'True-Client-IP: 203.0.113.42', { nonStandard: true, keywords: 'cdn 真实ip client ip proxy' }),
  header('CF-Connecting-IP', 'proxy', 'Carries the originating client IP through Cloudflare.', '通过 Cloudflare 传递原始客户端 IP。', 'CF-Connecting-IP: <client-ip>', 'CF-Connecting-IP: 203.0.113.42', { nonStandard: true, keywords: 'cloudflare cdn 真实ip client ip' }),
  header('Fastly-Client-IP', 'proxy', 'Carries the originating client IP through Fastly.', '通过 Fastly 传递原始客户端 IP。', 'Fastly-Client-IP: <client-ip>', 'Fastly-Client-IP: 203.0.113.42', { nonStandard: true, keywords: 'fastly cdn 真实ip client ip' }),
  header('Fly-Client-IP', 'proxy', 'Carries the originating client IP through Fly.io.', '通过 Fly.io 传递原始客户端 IP。', 'Fly-Client-IP: <client-ip>', 'Fly-Client-IP: 203.0.113.42', { nonStandard: true, keywords: 'fly.io proxy 真实ip client ip' }),
  header('CDN-Loop', 'proxy', 'Detects loops when a request traverses one or more CDNs.', '检测请求经过一个或多个 CDN 时形成的循环。', 'CDN-Loop: <cdn-info>, …', 'CDN-Loop: cdn.example; abc123', { keywords: 'cdn 循环检测 loop proxy rfc8586' }),
  header('X-Correlation-ID', 'proxy', 'Carries an application-defined identifier for correlating requests and logs.', '携带用于关联请求与日志的应用定义标识符。', 'X-Correlation-ID: <identifier>', 'X-Correlation-ID: order-7f0df10e', { nonStandard: true, keywords: '关联id 日志 correlation request log' }),
  header('X-HTTP-Method-Override', 'proxy', 'Asks an application to treat the request as another HTTP method.', '请求应用将当前请求视为另一种 HTTP 方法。', 'X-HTTP-Method-Override: <method>', 'X-HTTP-Method-Override: DELETE', { nonStandard: true, keywords: '方法覆盖 rest proxy method override' }),

  header('Sec-WebSocket-Key', 'websocket', 'Carries a random nonce for the WebSocket opening handshake.', '在 WebSocket 开始握手中携带随机数。', 'Sec-WebSocket-Key: <base64-value>', 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==', { keywords: '握手 handshake nonce upgrade' }),
  header('Sec-WebSocket-Version', 'websocket', 'States the WebSocket protocol version requested by the client.', '声明客户端请求使用的 WebSocket 协议版本。', 'Sec-WebSocket-Version: <version>', 'Sec-WebSocket-Version: 13', { keywords: '握手 handshake version upgrade' }),
  header('Sec-WebSocket-Protocol', 'websocket', 'Lists application subprotocols supported by the client.', '列出客户端支持的应用层子协议。', 'Sec-WebSocket-Protocol: <subprotocol>, …', 'Sec-WebSocket-Protocol: graphql-transport-ws, graphql-ws', { keywords: '子协议 subprotocol graphql handshake' }),
  header('Sec-WebSocket-Extensions', 'websocket', 'Lists WebSocket extensions supported by the client.', '列出客户端支持的 WebSocket 扩展。', 'Sec-WebSocket-Extensions: <extension> [; <parameter>], …', 'Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits', { keywords: '扩展 压缩 extension compression handshake' }),

  header('traceparent', 'tracing', 'Carries W3C Trace Context identifiers and sampling flags.', '携带 W3C Trace Context 的追踪标识和采样标志。', 'traceparent: <version>-<trace-id>-<parent-id>-<trace-flags>', 'traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01', { keywords: '链路追踪 分布式 tracing opentelemetry w3c' }),
  header('tracestate', 'tracing', 'Carries vendor-specific trace state alongside traceparent.', '与 traceparent 一起携带厂商特定的追踪状态。', 'tracestate: <key>=<value>, …', 'tracestate: rojo=00f067aa0ba902b7, congo=t61rcWkgMzE', { keywords: '链路追踪 分布式 tracing vendor w3c' }),
  header('baggage', 'tracing', 'Propagates application-defined properties across a trace.', '在整条追踪链路中传播应用定义的属性。', 'baggage: <key>=<value>[;<property>], …', 'baggage: userId=alice,serverNode=DF%2028', { keywords: '链路追踪 上下文 传播 tracing context w3c' }),
  header('b3', 'tracing', 'Carries Zipkin B3 trace context in a single header.', '使用单个请求头携带 Zipkin B3 追踪上下文。', 'b3: <trace-id>-<span-id>-<sampling-state>[-<parent-span-id>]', 'b3: 80f198ee56343ba864fe8b2a57d3eff7-e457b5a2e4d86bd1-1', { nonStandard: true, keywords: 'zipkin b3 链路追踪 span trace distributed tracing' }),
  header('X-B3-TraceId', 'tracing', 'Carries the Zipkin B3 trace identifier.', '携带 Zipkin B3 追踪标识符。', 'X-B3-TraceId: <trace-id>', 'X-B3-TraceId: 80f198ee56343ba864fe8b2a57d3eff7', { nonStandard: true, keywords: 'zipkin b3 链路追踪 trace id' }),
  header('X-B3-SpanId', 'tracing', 'Carries the Zipkin B3 current span identifier.', '携带 Zipkin B3 当前 Span 标识符。', 'X-B3-SpanId: <span-id>', 'X-B3-SpanId: e457b5a2e4d86bd1', { nonStandard: true, keywords: 'zipkin b3 链路追踪 span id' }),
  header('X-B3-ParentSpanId', 'tracing', 'Carries the Zipkin B3 parent span identifier.', '携带 Zipkin B3 父 Span 标识符。', 'X-B3-ParentSpanId: <span-id>', 'X-B3-ParentSpanId: 05e3ac9a4f6e3b90', { nonStandard: true, keywords: 'zipkin b3 链路追踪 parent span id' }),
  header('X-B3-Sampled', 'tracing', 'Carries the Zipkin B3 sampling decision.', '携带 Zipkin B3 采样决定。', 'X-B3-Sampled: 0 | 1 | true | false', 'X-B3-Sampled: 1', { nonStandard: true, keywords: 'zipkin b3 链路追踪 sampling sampled' }),
  header('uber-trace-id', 'tracing', 'Carries Jaeger trace context.', '携带 Jaeger 追踪上下文。', 'uber-trace-id: <trace-id>:<span-id>:<parent-span-id>:<flags>', 'uber-trace-id: 80f198ee56343ba8:e457b5a2e4d86bd1:0:1', { nonStandard: true, keywords: 'jaeger 链路追踪 span trace distributed tracing' }),
  header('X-Cloud-Trace-Context', 'tracing', 'Carries Google Cloud trace and sampling information.', '携带 Google Cloud 追踪与采样信息。', 'X-Cloud-Trace-Context: <trace-id>/<span-id>;o=<options>', 'X-Cloud-Trace-Context: 105445aa7843bc8bf206b120001000/1;o=1', { nonStandard: true, keywords: 'google cloud gcp 链路追踪 sampling trace' }),
  header('X-Amzn-Trace-Id', 'tracing', 'Carries AWS X-Ray tracing information.', '携带 AWS X-Ray 追踪信息。', 'X-Amzn-Trace-Id: Root=<trace-id>;Parent=<span-id>;Sampled=<0|1>', 'X-Amzn-Trace-Id: Root=1-67891233-abcdef012345678912345678;Parent=53995c3f42cd8ad8;Sampled=1', { nonStandard: true, keywords: 'aws x-ray 链路追踪 sampling trace amazon' }),
];
