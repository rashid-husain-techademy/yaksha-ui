import { Skill } from "../question-bank/question-bank-details";

export interface CategoryImport {
    Id: number;
    Name: string;
    skill: SkillDto[];
    skillName: SkillDto[];
}

export interface Category {
    Id: number;
    Name: string;
    skillId: number[];
}

export interface CreateCategoryDto {
    Id: number;
    Name: string;
    Description: string;
    IdNumber: string;
    SkillId: number[];
}

export interface GetCategoryDetails {
    categories: CategoryImport[];
    totalCount: number;
}

export interface SkillDto {
    id: number;
    name: string;
}

export interface ListCategoryDto {
    name: string;
    description: string;
    idNumber: string;
    skillCount: number;
    skillDetails: SkillDto[];
    skillNames: string[];
    categorySkillMappingList: CategorySkillMapping[];
}

export interface CategorySkillMapping {
    categoryId: number;
    skillId: number;
    category: Category;
    skill: Skill;
}