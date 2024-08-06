export interface MultiSelectDropdownSettings {
    singleSelection: boolean;
    idField: string;
    textField: string;
    allowSearchFilter: boolean;
    closeDropDownOnSelection: boolean
}

export interface ExtendedMultiSelectDropdownSettings extends MultiSelectDropdownSettings {
    itemsShowLimit: number;
    selectAllText:string;
    unSelectAllText:string
    enableCheckAll:boolean
}