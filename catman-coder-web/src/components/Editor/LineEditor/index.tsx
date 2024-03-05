import {editor, KeyCode} from "monaco-editor";
import {useEffect, useState} from "react";
import {Editor} from "@monaco-editor/react";

interface Props {
    code: string
    config?: object
    onChange?: (code: string) => void
}

const formatCode = (e?: editor.IStandaloneCodeEditor) => {
    if (!e) {
        return
    }
    const formatDocumentCommand = e.getAction("editor.action.formatDocument");
    if (formatDocumentCommand) {
        formatDocumentCommand.run()
        // 调整到第一行
        e.setPosition({lineNumber: 1, column: 1})
    }
}

const limitLine = (editor?: editor.IStandaloneCodeEditor) => {
    if (!editor) {
        return
    }
    editor.onDidChangeCursorPosition((e) => {
        // Monaco tells us the line number after cursor position changed
        if (e.position.lineNumber > 1) {
            // Trim editor value
            editor.setValue(editor.getValue().trim());
            // Bring back the cursor to the end of the first line
            editor.setPosition({
                ...e.position,
                // Setting column to Infinity would mean the end of the line
                column: Infinity,
                lineNumber: 1,
            });
        }
    });
    editor.addAction({
        id: "submitInSingleMode",
        label: "Submit in single mode",
        // Monaco ships with out of the box enums for keycodes and modifiers
        // So you can use them to define your keybinding
        keybindings: [KeyCode.Enter],
        run: () => {
            // submit the form here however suits you
            console.log("submitting form");
        },
    });


}

const MonacoLineEditor = (props: Props) => {

    const [code, setCode] = useState(props.code)
    const [editor, setEditor] = useState<editor.IStandaloneCodeEditor>()

    useEffect(() => {
        setCode(props.code)
    }, [props.code])

    useEffect(() => {
        if (props.onChange) {
            props.onChange(code)
        }
    }, [code]);
    // useEffect(() => {
    //     if (props.code === code) {
    //         formatCode(editor)
    //     }
    // }, [code, editor, props.code])

    return (
        <Editor
            // height={20}
            height={"40px"}
            className={"monaco-line-editor"}
            options={{
                // renderLineHighlight: "none",
                // colorDecorators: true,
                quickSuggestions: true,
                acceptSuggestionOnCommitCharacter: true,
                suggestOnTriggerCharacters: true,
                glyphMargin: false,
                lineDecorationsWidth: 1,
                folding: false,
                fixedOverflowWidgets: true,
                acceptSuggestionOnEnter: "on",
                hover: {
                    delay: 100,
                },
                // roundedSelection: false,
                contextmenu: false,
                cursorStyle: "line-thin",
                occurrencesHighlight: false,
                links: false,
                minimap: {enabled: false},
                // see: https://github.com/microsoft/monaco-editor/issues/1746
                wordBasedSuggestions: true,
                // disable `Find`
                find: {
                    addExtraSpaceOnTop: false,
                    autoFindInSelection: "never",
                    seedSearchStringFromSelection: "never",
                },
                fontSize: 16,
                fontWeight: "normal",
                wordWrap: "off",
                lineNumbers: "off",
                lineNumbersMinChars: 0,
                overviewRulerLanes: 0,
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                scrollBeyondLastColumn: 0,
                scrollbar: {
                    horizontal: "hidden",
                    vertical: "hidden",
                    // avoid can not scroll page when hover monaco
                    alwaysConsumeMouseWheel: false,
                },
            }}
            defaultLanguage="http"
            value={code}
            onChange={(v) => {
                setCode(v || "")
            }}
            onMount={(editor) => {
                setEditor(editor)
                formatCode(editor)
                limitLine(editor)
            }}
            beforeMount={(monaco) => {
                monaco.languages.register({id: "http"});
                // 用来快速完成http请求地址,支持{{value}}的方式
                // 用于匹配http请求地址(包含端口)匹配到第一个/停止匹配,比如匹配下列数据:
                // - http://localhost:8080  匹配内容为: http://localhost:8080
                // - http://localhost:8080/ 匹配内容为: http://localhost:8080
                // - http://localhost:8080/abc 匹配内容为: http://localhost:8080
                // - https://baidu.com/abc/def 匹配内容为: https://baidu.com
                // - https://baidu.com:8080/abc/def 匹配内容为: https://baidu.com:8080
                // - https://blog.csdn.net/avc/article/details/asdasda1312 匹配内容为: https://blog.csdn.net
                // 相应的正则为:
                // (https?://)?([a-z]([-a-z0-9]*[a-z0-9])?(\.[a-z]([-a-z0-9]*[a-z0-9])?)+|(\d+(\.\d+){3}))(:(\d){1,5})?/
                // 由于正则中包含了/,所以需要将其转义为js正则:
                //     /https?:\/\/)?([a-z]([-a-z0-9]*[a-z0-9])?(\.[a-z]([-a-z0-9]*[a-z0-9])?)+|(\d+(\.\d+){3}))(:(\d){1,5})?/
                //
                // 关键字token,表示匹配使用了{{value}}方式的字符串,比如:
                // - http://localhost:{{port}}/abc
                // - http://localhost:{{port}}/abc/{{name}}
                // - http://localhost:{{port}}/abc/{{name}}/{{age}}
                // 提取关键字对应的正则为: /\{\{.*}}/

                monaco.languages.setMonarchTokensProvider("http", {
                    ignoreCase: true,
                    tokenizer: {
                        root: [
                            [/https?:\/\/\)?([a-z]([-a-z0-9]*[a-z0-9])?(\.[a-z]([-a-z0-9]*[a-z0-9])?)+|(\d+(\.\d+){3}))(:(\d){1,5})?/,{token: "comment"}],
                            [/\{\{.*}}/, {token: "comment.doc"}],
                        ]
                    }
                });
                // 注册http语言的提示,包括,自动完成http,https
                // 自动完成localhost,127.0.0.1,192.168.*.*
                monaco.languages.registerCompletionItemProvider("http", {
                    triggerCharacters: [":", "/", "."],
                    provideCompletionItems: () => {
                        return {
                            suggestions: [
                                {
                                    label: "http",
                                    kind: monaco.languages.CompletionItemKind.Keyword,
                                    insertText: "http://",
                                    range: {
                                        startLineNumber: 1,
                                        endLineNumber: 1,
                                        startColumn: 1,
                                        endColumn: 1,
                                    },
                                },
                                {
                                    label: "https",
                                    kind: monaco.languages.CompletionItemKind.Keyword,
                                    insertText: "https://",
                                    range: {
                                        startLineNumber: 1,
                                        endLineNumber: 1,
                                        startColumn: 1,
                                        endColumn: 1,
                                    },
                                },
                                {
                                    label: "localhost",
                                    kind: monaco.languages.CompletionItemKind.Keyword,
                                    insertText: "localhost",
                                    // range: {
                                    //     startLineNumber: 1,
                                    //     endLineNumber: 1,
                                    //     startColumn: 1,
                                    //     endColumn: 1,
                                    // },
                                },
                                {
                                    label: ":8080",
                                    kind: monaco.languages.CompletionItemKind.Keyword,
                                    insertText: "localhost",
                                    // commitCharacters:[":",":8080",":3000",":8081"],
                                    // range: {
                                    //     startLineNumber: 1,
                                    //     endLineNumber: 1,
                                    //     startColumn: 1,
                                    //     endColumn: 1,
                                    // },
                                },
                                {
                                    label: ":8000",
                                    kind: monaco.languages.CompletionItemKind.Keyword,
                                    insertText: "localhost",
                                    // commitCharacters:[":",":8080",":3000",":8081"],
                                    // range: {
                                    //     startLineNumber: 1,
                                    //     endLineNumber: 1,
                                    //     startColumn: 1,
                                    //     endColumn: 1,
                                    // },
                                },
                                {
                                    label: "192.168.*.*",
                                    kind: monaco.languages.CompletionItemKind.Keyword,
                                    insertText: "192.168.",
                                }
                            ]

                        }
                    }
                })
            }
            }
            {
                ...props.config
            }
        />
    )

}

export default MonacoLineEditor