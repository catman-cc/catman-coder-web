import {useEffect, useState} from "react";
import {Console, Decode, Hook} from "console-feed";
import {Message} from "console-feed/lib/definitions/Console";
import {Card} from "antd";

export const EventBoard = () => {
    const [logs, setLogs] = useState<Message[]>([])
    useEffect(() => {
        Hook(window.console, (log) => {
            setLogs([...logs, Decode(log)])
        })
    },[])
    return (
        <Card
            style={{
                width: "100%",
                height: "100%",
            }}
        >
            <Console logs={logs}  />
        </Card>
    )
}