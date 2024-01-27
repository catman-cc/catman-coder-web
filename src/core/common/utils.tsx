/**
 * 计算字符串的大小,单位依次为: B,KB,MB,GB,TB
 * @param str
 */
export function computeStrSize(str: string) {
    const size = str.length;
    if (size < 1024) {
        return `${size}B`;
    }
    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)}KB`;
    }
    if (size < 1024 * 1024 * 1024) {
        return `${(size / 1024 / 1024).toFixed(2)}MB`;
    }
    if (size < 1024 * 1024 * 1024 * 1024) {
        return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`;
    }
    return `${(size / 1024 / 1024 / 1024 / 1024).toFixed(2)}TB`;
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

/**
 *  验证ip地址是否合法
 * @param ip 被解析的ip地址
 * @returns 1 合法地址  0 属于有效ip地址的一部分  -1 非法ip
 */
export function validateIP(ip: string) {
    // 利用正则表达式检查 IP 地址的格式
    const ipRegex = /^\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/(?:[0-9]|[1-2][0-9]|3[0-2]))?\b$/;

    // 判断 IP 地址是否符合正则表达式
    if (ipRegex.test(ip)) {
        return 1;
    } else {
        // 如果不合法，检查是否属于有效 IP 地址的一部分
        const ipParts: (string)[] = ip.split('.');
        for (let i = 0; i < ipParts.length; i++) {
            if (!isNumeric(ipParts[i])) {
                return -1
            }
            const part = parseInt(ipParts[i], 10);
            if (isNaN(part) || part < 0 || part > 255) {

                return -1;
            }
        }
        return 0;
    }
}
/**
 *  判断一个字符串是否由纯数字构成
 * @param str  字符串
 * @returns  是否是数字
 */
export function isNumeric(str: string) {
    const numericRegex = /^[0-9]+$/;
    return numericRegex.test(str);
}
export type IPAddressType = "PUBLIC" | "INNER" | "MULTI-BROADCAST" | "RESERVED" | "UNKNOWN"

/**
 * 将ip地址类型转换为中文
 * @param type  ip地址类型
 * @returns  中文
 */
export function convertIPAddressType(type: IPAddressType): string {
    switch (type) {
        case "INNER":
            return "内网地址"
        case "PUBLIC":
            return "公网地址"
        case "MULTI-BROADCAST":
            return "多播地址"
        case "RESERVED":
            return "保留地址"
        case "UNKNOWN":
            return "未知类型"
    }
}
/**
 *  判断一个ip地址的类型
 * @param ip  ip地址
 * @returns  类型
 */
export function getIPAddressType(ip: string): IPAddressType {
    // 分割IP地址和子网掩码
    const [ipAddress,] = ip.split('/');

    // 将IP地址拆分为四个部分
    const ipParts = ipAddress.split('.').map(Number);

    // 判断是否是内网IP
    if (
        (ipParts[0] === 10) ||
        (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) ||
        (ipParts[0] === 192 && ipParts[1] === 168)
    ) {
        return "INNER"
    }

    // 判断是否是多播地址
    if (ipParts[0] >= 224 && ipParts[0] <= 239) {
        return "MULTI-BROADCAST"
    }

    // 判断是否是保留地址
    if (ipParts[0] === 0 || ipParts[0] === 255) {
        return "RESERVED"
    }

    // 判断是否是公网IP
    return "PUBLIC";
}