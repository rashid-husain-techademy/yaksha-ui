export interface SkillImport
{
    id:number;
    name:string;
}
export interface SkillDetails
{
    searchString:string | null;
    ID: number;
    skipCount: number;
    maxResultCount: number;
}
export interface SkillsList {
    skills: SkillList[];
    totalCount: number;
}
export interface SkillList {
    id: number;
    name:string;
}