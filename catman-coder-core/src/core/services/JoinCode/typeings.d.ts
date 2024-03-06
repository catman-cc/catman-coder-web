import { ExecutorJoinCodeStatus } from ".";
export interface IPStrategy {
  /**
   * 策略ID
   */
  id?: string;

  /**
   * ip地址
   */
  ip?: string;

  /**
   * 是否禁止访问
   */
  isDeny?: boolean;
}

export interface ExecutorJoinCode extends Base {
  /**
   * 接入码ID
   */
  id?: string;

  /**
   * 接入码类型
   */
  kind?: string;
  /**
   * 接入码支持的类型
   */
  supportedKinds?: string[];
  /**
   * 和ID类似,但不是唯一的,可以重复,场景: 刷新接入码
   */
  key?: string;

  /**
   * 接入码名称
   */
  name?: string;

  /**
   * 接入码
   */
  code?: string;

  /**
   * 接入码是否已禁用
   */
  disabled?: boolean;

  /**
   * 接入码是否可重复使用,示例:
   *  - A使用接入码,接入成功
   *  - B使用接入码,是否替换掉A
   */
  repeatable?: boolean;

  /**
   *
   * 最大可重复使用次数,-1表示无限制
   */
  maxRepeatable?: number;

  /**
   * 是否限制允许连接的时间
   */
  limitAccessTime?: boolean;

  /**
   * 接入后,允许访问的时间,单位毫秒,-1表示无限制
   * 执行协调器会根据这个时间来判断是否允许访问
   */
  allowedAccessTime?: number;

  /**
   * 在指定时间后,允许接入
   */
  allowAccessStartTime?: number;

  /**
   * 在指定时间后,禁止接入
   */
  allowAccessEndTime?: number;

  /**
   * 是否限制允许连接的IP地址
   */
  limitAccessIps?: boolean;
  /**
   * ip过滤策略
   */
  ipFilter?: IPStrategy[];
  /**
   * 是否已失效
   */
  invalid?: boolean;
  /**
   * 失效原因
   */
  invalidReason?: string;

  status?: ExecutorJoinCodeStatus;
}
