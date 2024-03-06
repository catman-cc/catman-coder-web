import React from "react";
import { Input, InputRef, Modal, Space } from "antd";
import { ModalProps } from "antd/es/modal/interface";
import { IApplicationContext as ApplicationContext } from "@/core/entity/Common";

export interface CreationModalProps {
  context: ApplicationContext;
  modelConfig?: ModalProps;
  onOk: (info: { name: string }) => void;
}

export interface ResourceCreationModalState {
  open: boolean;
  type: string;
}

export class CreationModal extends React.Component<
  CreationModalProps,
  ResourceCreationModalState
> {
  nameInput: InputRef | undefined;
  constructor(props: Readonly<CreationModalProps>) {
    super(props);
    this.state = {
      open: true,
      type: "string",
    };
  }

  componentDidMount() {
    this.nameInput?.focus();
  }
  render() {
    return (
      <Modal
        {...this.props.modelConfig}
        rootClassName={"resource-model"}
        style={{
          maxWidth: 300,
        }}
        title={"新建"}
        footer={<></>}
        open={this.state.open}
        maskClosable={true}
        onCancel={() => {
          this.setState({ open: false });
        }}
        closable={false}
        destroyOnClose
        afterClose={() => {
          this.props.context.resourceContext?.closeModel();
        }}
      >
        <Space>
          <Input
            ref={(input) => {
              this.nameInput = input!;
            }}
            defaultChecked
            autoFocus
            onPressEnter={(e) => {
              this.setState({ open: false });
              this.props.onOk({
                name: e.currentTarget.value,
              });
            }}
          ></Input>
        </Space>
      </Modal>
    );
  }
}
