import { Editor } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useEffect, useState } from "react";
interface Props {
    code: string
    config?: object
}
const formatCode = (e?: editor.IStandaloneCodeEditor) => {
    if (!e) {
        return
    }
    const formatDocumentCommand = e.getAction("editor.action.formatDocument");
    if (formatDocumentCommand) {
        formatDocumentCommand.run()
        // 调整到第一行
        e.setPosition({ lineNumber: 1, column: 1 })
    }
}

const MonacoCodeEditor = (props: Props) => {

    const [code, setCode] = useState(props.code)
    const [editor, setEditor] = useState<editor.IStandaloneCodeEditor>()


    useEffect(() => {
        setCode(props.code)
    }, [props.code])

    useEffect(() => {
        if (props.code === code) {
            formatCode(editor)
        }
    }, [code, editor, props.code])

    return (
        <Editor
            height="90vh"
            options={{
                minimap: {
                    enabled: false
                },
            }}
            defaultLanguage="json"
            value={code}
            onChange={(v) => {
                setCode(v || "")
            }}
            onMount={(editor) => {
                setEditor(editor)
                formatCode(editor)
            }}
            {
            ...props.config
            }
        />
    )
    // return (
    //     <MonacoEditor
    //         theme="vs-dark"
    //         language="json"
    //         value={props.code}
    //         // options={options}
    //         editorDidMount={(editor) => {
    //             editor.focus();
    //         }}
    //     />
    // );
}

export default MonacoCodeEditor