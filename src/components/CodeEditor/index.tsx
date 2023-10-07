import { Editor } from "@monaco-editor/react";
interface Props {
    code: string
    config?: object
}
const MonacoCodeEditor = (props: Props) => {
    return (
        <Editor

            height="90vh"
            options={{
                minimap: {
                    enabled: false
                },
            }}
            defaultLanguage="json"
            defaultValue={props.code}

            onMount={(editor) => {
                setTimeout(() => {
                    const formatDocumentCommand = editor.getAction("editor.action.formatDocument");
                    if (formatDocumentCommand) {
                        formatDocumentCommand.run()
                    }
                }, 200);
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