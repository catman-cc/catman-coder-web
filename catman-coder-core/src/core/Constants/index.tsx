export const Constants = {
  Types: {
    TYPE_NAME_STRING: "string",
    TYPE_NAME_NUMBER: "number",
    TYPE_NAME_STRUCT: "struct",
    TYPE_NAME_ARRAY: "array",
    TYPE_NAME_BOOLEAN: "boolean",
    TYPE_NAME_MAP: "map",
    TYPE_NAME_REFER: "refer",
    TYPE_NAME_ENUM: "enum",
  },
  ARRAY_ITEM_NAME: "elements",
  DEFAULT_NEW_TYPE_DEFINITION_NAME: "新建参数定义",
  EventGroup: {
    defaultGroup: "default_group",
  },
  EventName: {
    newTypeDefinition: "new-type-definition",
  },
  Resource: {
    /**
     * 资源管理器的常量数据
     */
    explorer: {
      menu: {
        ids: {
          create: "create",
          rename: "rename",
          delete: "delete",
        },
      },
    },
    kind: {
      typeDefinition: "td",
      httpValueProviderQuicker: "HttpValueProviderQuicker",
      function: "function",
      job: "job",
    },
  },
};
export default Constants;
