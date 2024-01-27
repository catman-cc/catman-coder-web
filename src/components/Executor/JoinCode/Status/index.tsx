import { ExecutorJoinCodeStatus } from "@/services/JoinCode"
import { Tag } from "antd"

export const ExecutorJoinStatusTag = (
    { status }: {
        status: ExecutorJoinCodeStatus
    }
) => {
    const desc = parseStatus(status)
    return <Tag
        key={status}
        color={desc.color}
    >
        {desc.text}
    </Tag>
}

export function parseStatus(status: ExecutorJoinCodeStatus): {
    text: string, color: string
} {
    switch (status) {
        case ExecutorJoinCodeStatus.WAIT_ACTIVE:
            return {
                text: "待激活",
                color: "gray"
            }
        case ExecutorJoinCodeStatus.VALID:
            return {
                text: "生效中",
                color: "green"
            }
        case ExecutorJoinCodeStatus.INVALID:
            return {
                text: "无效",
                color: "red"
            }
        case ExecutorJoinCodeStatus.EXPIRED:
            return {
                text: "已过期",
                color: "red"
            }
        case ExecutorJoinCodeStatus.USED:
            return {
                text: "已使用",
                color: "blue"
            }
        case ExecutorJoinCodeStatus.DISABLED:
            return {
                text: "已使用",
                color: "warning"
            }
        default:
            return {
                text: "未知的",
                color: "red"
            }
    }
}