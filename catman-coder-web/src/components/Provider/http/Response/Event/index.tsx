import {useEffect, useState} from "react";
import {Console} from "console-feed";
interface EventConsoleProps {
    logs: any[]
}
export const EventConsole = (props:EventConsoleProps) => {
    const [logs, setLogs] = useState([])

    useEffect(() => {
        setLogs(props.logs)
    }, [props]);

    return <Console logs={logs} />
}
