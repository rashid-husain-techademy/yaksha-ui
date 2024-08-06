export class MenuItem {
    name = '';
    permissionName = '';
    route = '';
    toolTip = '';
    items: MenuItem[];

    constructor(name: string, permissionName: string, route: string, toolTip: string, childItems: MenuItem[] = null) {
        this.name = name;
        this.permissionName = permissionName;
        this.route = route;   
        this.toolTip = toolTip;   
        if (childItems) {
            this.items = childItems;
        } else {
            this.items = [];
        }
    }
}
