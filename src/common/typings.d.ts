
declare namespace Core {
    interface Config {

    }
    type Scope = "PRIVATE" | "PUBlIC"

    interface Mock {
        kind: string
        name: string
    }

    interface Tag {
        id: string
        name: string
    }

    interface Group {
        id: string
        name: string
        namespace: string
    }

    interface Label {
        name: string
        value: string[]
        labels: Labels
    }

    interface Labels {
        labels: Labels
        items: Map<string, Label>
    }

    interface Type {
        typeName: string
        items: TypeDefinition[]
    }

    interface TypeDefinition {
        id?: string
        name: string
        scope: Scope
        labels?: Labels
        type: Type
        tag?: Tag[]
        group: Group
        mock?: Mock
        alias?: string[]
        defaultValue?: string
        describe?: string
        wiki?: string
    }

}