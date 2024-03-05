import { Button, Divider, Tag, message } from "antd";

import { saveSchema } from "@/services/typeDefinitions";
import { useState } from "react";
import { TypeDefinitionHierarchialSchema } from "../HierarchicalSchema/TypeDefinitionSchemaParse";
import { HierarchicalDnd } from "./dnd";
import "./index.less";
export interface TypeDefinitionSchemaEditorProps {
  schema?: Core.TypeDefinitionSchema;
  updateSchema?: (schema: Core.TypeDefinitionSchema) => void;
}
export const TypeDefinitionSchemaEditor = (
  props: TypeDefinitionSchemaEditorProps,
) => {
  const [schema, setSchema] = useState(TypeDefinitionHierarchialSchema.of(props.schema!));
  schema.addWatcher((n) => {
    setSchema(n)
  })
  const [saveLoading, setSaveLoading] = useState(false)

  return (
    <div className={"type-definition-schema-editor"}>
      <div className={"type-definition-schema-editor-title"}>
        <Button
          loading={saveLoading}
          onClick={() => {
            setSaveLoading(true)
            saveSchema(schema.toTypeDefinitionSchema()!).then((res) => {
              setSaveLoading(false)
              message.info(<span>
                类型定义:<Tag color="blue">{schema.get(schema.registry.root).name}</Tag>保存成功
              </span>)
            });
          }}
        >
          save
        </Button>
      </div>
      <div>
        <Divider />
        <div>
          <HierarchicalDnd treeId={schema.registry.root} schema={schema}
            renderChildrenIfPublic
          />
        </div>
      </div>
      {/* <div className={"type-definition-schema-editor-body"}>
        <TypeDefinitionEditor
          defaultSchema={schema!}
          onChange={(newSchema) => {
            setSchema({ ...newSchema });
          }}
        />
      </div> */}
    </div >
  );
};
