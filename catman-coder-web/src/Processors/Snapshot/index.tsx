import {
  Core,
  Processor,
  Resource,
  IApplicationContext as ApplicationContext,
  Menu,
} from "catman-coder-core";
import IconCN from "@/components/Icon";
import { ItemParams } from "react-contexify";

export class SnapshotProcessor implements Processor {
  before(context: ApplicationContext): void {
    // 在resource中注册一个快捷键,用于提供访问控制
    const menuContext = context.resourceContext!.explorer!.menuContext!;

    menuContext.menus().children!.push(
      ...([
        {
          id: "snapshot-manager",
          type: "submenu",
          label: (
            <div className={"flex justify-between content-between"}>
              <div style={{ marginRight: "5px" }}>
                <IconCN type={"icon-quanxian"} />
              </div>
              <div>快照管理</div>
            </div>
          ),
          children: [
            {
              id: "snapshot-create",
              type: "item",
              label: "创建快照",
              children: [],
            } as unknown as Menu<Resource>,
            {
              id: "snapshot-list",
              type: "item",
              label: "查看快照列表",
              children: [],
              onMenuClick: (_menu, resource) => {},
            } as unknown as Menu<Resource>,
          ],
          onMenuClick: (
            menu: Menu<Resource>,
            resource: Resource,
            itemParams: ItemParams,
          ) => {
            // 展示一个权限控制面板
            alert("展示一个权限控制面板");
          },
        },
      ] as unknown as Menu<Resource>[]),
    );
  }
}
