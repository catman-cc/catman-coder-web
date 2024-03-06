/**
 * 计算两个字符串之间的编辑距离
 * @param a 字符串a
 * @param b 字符串b
 */
export const levenshteinDistance = (a: string, b: string): number => {
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
        distanceMatrix[j - 1][i - 1] + indicator
      );
    }
  }

  return distanceMatrix[b.length][a.length];
};

/**
 * 计算字符串的大小,单位依次为: B,KB,MB,GB,TB
 * @param str
 */
export const computeStrSize = (str: string): string => {
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
};

/**
 *  判断一个字符串是否由纯数字构成
 * @param str  字符串
 * @returns  是否是数字
 */
export const isNumeric = (str: string): boolean => {
  const numericRegex = /^[0-9]+$/;
  return numericRegex.test(str);
};
