import { Core } from "@/common/typings"
import TypeMenu from "@/components/TypeDefinition/Menu"
import TypeDefinitionTreePanel from "@/components/TypeDefinition/Tree"
import { IJsonModel, TabNode } from "flexlayout-react"

export const Components = [
    {
        name: 'type-definition-tree',
        render: (node: TabNode) => {
            const config = node.getExtraData()
            const td = config?.td
            return <TypeDefinitionTreePanel td={td} />
        }
    },
    {
        name: 'type-definition-menu',
        render: (node: TabNode) => {
            const data = node.getExtraData()
            const tds = data?.tds
            return <TypeMenu
                tds={tds}
                unSavedTds={[]}
                selectTypeDefinition={() => { }}
                createTypeDefinition={() => { return Core.DefaultTypeDefinition.create() }}
                save={() => { }} />
        }
    }
]

export const DefaultLayout: IJsonModel = {
    "global": {
        "enableRotateBorderIcons": false,
        "tabIcon": "close",
        // "tabSetTabLocation": "bottom",
        "borderClassName": "border"
    },
    "borders": [
        {
            "type": "border",
            "config": {
                "type": [
                    "td"
                ]
            },
            "size": 300,
            "location": "left",
            "children": [
                {
                    "type": "tab",
                    "id": "#56c90a5b-d84f-4e73-8e27-d824e21f4aa2",
                    "name": "ccc",
                    "component": "button",
                    "config": {
                        "type": "td",
                        "iconOnly": true
                    },
                    "enableClose": false,
                    "icon": "icons/json.svg"
                },
            ]
        },
        {
            "type": "border",
            "config": {
                "type": [
                    "td"
                ]
            },
            "size": 300,
            "location": "bottom",
            "children": [

            ]
        },
        {
            "type": "border",
            "config": {
                "type": [
                    "td"
                ]
            },
            "size": 300,
            "location": "right",
            "children": [

            ]
        }
    ],
    "layout": {
        "type": "row",
        "id": "#fa5496cc-ead0-4170-9a32-f2066522e55f",
        "children": [
            {
                "type": "tabset",
                "id": "#688e372a-3c7b-4bdd-977d-bfa6a3736f9f",
                "selected": -1,
                "children": [

                ],
                "active": true
            }
        ]
    }
}