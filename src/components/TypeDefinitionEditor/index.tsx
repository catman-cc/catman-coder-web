import "./index.less";
import { TypeDefinitionEditor } from "@/components/TypeDefinitionEditor/EditorPanel";
import { useEffect, useState } from "react";
import { Button } from "antd";
import { saveSchema } from "@/services/typeDefinitions";
export interface TypeDefinitionSchemaEditorProps {
  schema?: Core.TypeDefinitionSchema;
  updateSchema?: (schema: Core.TypeDefinitionSchema) => void;
}
export const TypeDefinitionSchemaEditor = (
  props: TypeDefinitionSchemaEditorProps,
) => {
  const [schema, setSchema] = useState(props.schema);

  useEffect(() => {
    setSchema(props.schema);
  }, [props]);

  return (
    <div className={"type-definition-schema-editor"}>
      <div className={"type-definition-schema-editor-title"}>
        <Button
          onClick={() => {
            saveSchema(schema!).then((res) => {
              console.log(res);
            });
          }}
        >
          save
        </Button>
      </div>
      <div className={"type-definition-schema-editor-body"}>
        <TypeDefinitionEditor
          schema={schema}
          onSave={(newSchema) => {
            setSchema(newSchema);
          }}
        />
      </div>
    </div>
  );
};
