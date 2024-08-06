import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '@app/models/constants';
import { QuestionBankService } from '../question-bank.services';
import { QbQuestionDetails } from '../question-bank-details';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewQuestionComponent } from '@app/admin/assessment/view-question/view-question.component';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  constants = Constants;
  searchString: string;
  questionsData: QbQuestionDetails[];
  totalCount: number;
  pageSizes: number[] = [10, 20, 30];
  pageIndex: number = 1;
  pageSize: number = 10;
  maxSize: number = 5;
  disableBackButton: boolean;
  disableLoadMoreButton: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private questionBankService: QuestionBankService,
    private toastrService: ToastrService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(param => {
      this.searchString = atob(param['searchString']);
      this.pageIndex = 1;
      this.getQbQuestionDetails(this.searchString);
    });
  }

  getQbQuestionDetails(searchString: string) {
    this.questionBankService.getQbQuestionDetials(encodeURIComponent(searchString), this.pageSize, this.pageIndex).subscribe(res => {
      this.questionsData = res.result;
      this.disableBackButton = this.pageIndex == 1 ? true : false;
      this.disableLoadMoreButton = this.questionsData.length < 10 ? true : false;
    });
  }

  copyText(idNumber: string): void {
    let copyText = idNumber;
    const selectBox = document.createElement('textarea');
    selectBox.style.position = 'fixed';
    selectBox.style.left = '0';
    selectBox.style.top = '0';
    selectBox.style.opacity = '0';
    selectBox.value = copyText;
    document.body.appendChild(selectBox);
    selectBox.focus();
    selectBox.select();
    document.execCommand('copy');
    document.body.removeChild(selectBox);
    this.toastrService.success(Constants.copiedToClipboard);
  }

  viewQuestion(questionText: string, choice: string, skill: string, category: string, questiontypeId = 0) {
    let choices: string[] = [];
    if (Number(questiontypeId) === this.constants.multipleChoiceId) {
      choices = JSON.parse(choice);
      choices = choices.map((choice) => choice.replace(/<p>/gi, '<p style="margin-bottom:0px">'));
    }
    const modalRef = this.modalService.open(ViewQuestionComponent, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.questionText = questionText;
    modalRef.componentInstance.choices = choices;
    modalRef.componentInstance.skill = skill;
    modalRef.componentInstance.category = category;
    modalRef.componentInstance.isMcq = Number(questiontypeId) === this.constants.multipleChoiceId ? true : false;
  }

  loadPage() {
    this.getQbQuestionDetails(this.searchString);
  }

  changePageSize() {
    this.getQbQuestionDetails(this.searchString);
  }

  loadMore() {
    this.pageIndex++;
    this.getQbQuestionDetails(this.searchString);
  }

  back() {
    this.pageIndex--;
    this.getQbQuestionDetails(this.searchString);
  }
}