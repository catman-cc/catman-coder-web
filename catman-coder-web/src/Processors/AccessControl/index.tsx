/**
 * 访问控制模块,提供快捷配置访问权限的能力
 */
import {
  Processor,
  Resource,
  IApplicationContext as ApplicationContext,
  Menu,
} from "catman-coder-core";
import IconCN from "@/components/Icon";
import { ItemParams } from "react-contexify";

export class AccessControlProcessor implements Processor {
  before(context: ApplicationContext) {
    // 在resource中注册一个快捷键,用于提供访问控制
    const menuContext = context.resourceContext!.explorer!.menuContext!;

    menuContext.menus().children!.push(
      ...([
        {
          id: "access-control-config",
          type: "item",
          label: (
            <div className={"flex justify-between content-between"}>
              <div style={{ marginRight: "5px" }}>
                <IconCN type={"icon-quanxian"} />
              </div>
              <div>访问权限配置</div>
            </div>
          ),
          onMenuClick: (
            _menu: Menu<Resource>,
            _resource: Resource,
            _itemParams: ItemParams,
          ) => {
            // 展示一个权限控制面板
            alert("展示一个权限控制面板");
          },
        },
      ] as unknown as Menu<Resource>[]),
    );
  }

  after(_context: ApplicationContext): void {}

  run(_context: ApplicationContext): void {}
}
