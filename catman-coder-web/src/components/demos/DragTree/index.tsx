import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export const DragTree() => {
    const webSocket = new WebSocket("",[],{})
    webSocket.onopen=(e=>{
        webSocket.
    })
    return (
        <DndProvider backend={HTML5Backend}>

        </DndProvider>
    )
}