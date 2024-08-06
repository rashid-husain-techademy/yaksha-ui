import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Skills } from '@app/admin/question/question-details';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
import { AppComponentBase } from '@shared/app-component-base';
import { Constants } from '../../../models/constants';
import { Category, QuestionBankSkillFilter, Skill, SkillFilter, SkillResult } from '../question-bank-details';
import { QuestionBankService } from '../question-bank.services';
import { Helper } from '@app/shared/helper';

@Component({
  selector: 'app-view-question-bank',
  templateUrl: './view-question-bank.component.html',
  styleUrls: ['./view-question-bank.component.scss']
})
export class ViewQuestionBankComponent extends AppComponentBase implements OnInit {

  constants = Constants;
  pageSizes: number[] = [10, 20, 30];
  pageIndex: number = 1;
  pageSize: number = 12;
  maxSize: number = 5;
  tenantId: number;
  questionBankId: number;
  categories: Category;
  skills: Skill[];
  skillDetails: SkillResult;
  categoryId: number;
  skillId: number;
  searchString: string;
  selectedSkill: Skills;
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };

  questionBankName: string;
  tenantName: string;

  constructor(
    private questionBankService: QuestionBankService,
    private activatedRoute: ActivatedRoute,
    injector: Injector) { super(injector); }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.questionBankId = +atob(params['id']);
    });
    this.tenantId = this.appSession.tenantId;
    this.getQuestionBankCategories();
    this.getQuestionBankDetails();
    this.GetSkillDetails();
    this.getQuestionBankSkills();
  }

  getQuestionBankDetails(): void {
    this.questionBankService.getQuestionBankDetails(this.questionBankId).subscribe(res => {
      if (res && res.result) {
        this.questionBankName = res.result.questionBankDetail.name;
        this.tenantName = res.result.tenantName;
      }
    },
      error => {
        console.error(error);
      });
  }

  getQuestionBankCategories(): void {
    this.questionBankService.getCategories(this.questionBankId).subscribe(res => {
      if (res && res.result) {
        this.categories = res.result;
      }
    },
      error => {
        console.error(error);
      });
  }

  selectCategory(event): void {
    this.categoryId = event.id;
    this.pageIndex = 1;
    if (isNaN(this.categoryId)) {
      this.reset();
    }
    else {
      this.GetSkillDetails();
    }
  }

  selectSkill(event): void {
    this.skillId = event.id;
    this.pageIndex = 1;
    this.GetSkillDetails();
  }

  onSkillDeselect() {
    this.skillId = undefined;
    this.GetSkillDetails();
  }

  GetSkills(): void {
    let data: QuestionBankSkillFilter = {
      QuestionBankId: this.questionBankId,
      CategoryId: this.categoryId
    };
    this.questionBankService.getQuestionBankSkills(data).subscribe(res => {
      this.skills = res.result;
    },
      error => {
        console.error(error);
      });
  }

  GetSkillDetails(): void {
    let data: SkillFilter = {
      QuestionBankId: this.questionBankId,
      CategoryId: !isNaN(this.categoryId) ? this.categoryId : null,
      SkillId: !isNaN(this.skillId) ? this.skillId : null,
      SkipCount: (this.pageIndex - 1) * this.pageSize,
      MaxResultCount: this.pageSize,
      SkillName: this.searchString !== undefined && this.searchString ? this.searchString : null
    };
    this.questionBankService.getSearchSkillDetails(data).subscribe(res => {
      this.skillDetails = res.result;
      if (this.skillDetails.skills !== null && this.skillDetails.skills.length > 0) {
        this.skillDetails.skills.forEach(skill => {
          skill.MCQ = skill.Coding = skill.Stack = skill.TotalQuestions = 0;
          let questionCount = JSON.parse(skill.questionCount);
          if (questionCount !== null && questionCount.length > 0) {
            questionCount.forEach(type => {
              if (parseInt(type.QuestionTypeId) === this.constants.mcqTypeId) {
                skill.MCQ = type.Count;
                skill.TotalQuestions += skill.MCQ;
              }
              if (parseInt(type.QuestionTypeId) === this.constants.codingTypeId) {
                skill.Coding = type.Count;
                skill.TotalQuestions += skill.Coding;
              }
              if (parseInt(type.QuestionTypeId) === this.constants.stackTypeId) {
                skill.Stack = type.Count;
                skill.TotalQuestions += skill.Stack;
              }
            });
          }
        });
      }
    });
  }

  loadPage() {
    this.GetSkillDetails();
  }

  changePageSize() {
    this.pageIndex = 1;
    this.GetSkillDetails();
  }

  search(event: any): void {
    this.pageIndex = 1;
    this.searchString = event.target.value;
    this.GetSkillDetails();
  }

  reset(): void {
    this.skills = [];
    this.categoryId = undefined;
    this.skillId = undefined;
    this.skillDetails.skills = [];
    this.skillDetails.totalCount = 0;
    this.selectedSkill = { name: '', id: 0, imageUrl: '' };
    this.pageIndex = 1;
    this.searchString = "";
    this.GetSkillDetails();
  }

  getQuestionBankSkills() {
    this.questionBankService.getQuestionBankSkill(this.questionBankId).subscribe(res => {
      if (res.success && res.result.length > 0) {
        let sortedSkills = res.result.sort(Helper.sortString<Skill>('name'));
        this.skills = sortedSkills;
      }
    },
    error => {
      console.error(error);
    });
  }

  onDeSelectCategory() {
    this.categoryId = undefined;
    this.GetSkillDetails();
  }
}
