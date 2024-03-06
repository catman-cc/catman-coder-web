import { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  show: {
    id: boolean;
    group: boolean;
    name: boolean;
  };
  data: Base;
  copyable: boolean;
  update: (_base: Base) => void;
}

const BaseTitle = (props: Props) => {
  return (
    <div className="flex justify-between">
      <div>
        {props.icon && props.icon}
        {props.show.id && props.data.id}
      </div>
    </div>
  );
};

export default BaseTitle;
