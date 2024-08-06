import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionReviewStatus, ReviewerComment } from '@app/enums/question-bank-type';
import { Constants } from '@app/models/constants';
import { AppSessionService } from '@shared/session/app-session.service';
import { ToastrService } from 'ngx-toastr';
import { AdminReplyDto, AssessmentReviewerUserDto, AssessmentSections, QuestionReviews, Questions, RequestAssessmentQuestions, ResultReviewAssessmentQuestions, ReviewCommentsDto, ReviewerCommentCheckDto, SkillDto, SubSkillRequestDto, UpdateReviewStatusDto, updateSections } from '../assessment-review';
import { AssessmentReviewService } from '../assessment-review.service';
import { dataService } from '@app/service/common/dataService';
import { UserRoles } from '@app/enums/user-roles';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReviewQuestionnaireComponent } from '../review-questionnaire/review-questionnaire.component';
import { Helper } from '@app/shared/helper';
import { UtilsService } from 'abp-ng2-module';
import { AssessmentOperationComponent } from '@app/admin/assessment/assessment-operation/assessment-operation.component';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';

@Component({
  selector: 'app-verify-questionnaire',
  templateUrl: './verify-questionnaire.component.html',
  styleUrls: ['./verify-questionnaire.component.scss']
})
export class VerifyQuestionnaireComponent implements OnInit {
  currentQuestion: Questions;
  assessmentDetails: ResultReviewAssessmentQuestions;
  assessmentSections: AssessmentSections[];
  currentSelectedSection: AssessmentSections;
  currentSelectedSectionQuestions: Questions[];
  assessmentQuestions: Questions[] = [];
  questionsCount: number = 0;
  constants = Constants;
  tenantAssessmentReviewId: number;
  feedback: string;
  questionReviewStatus = QuestionReviewStatus;
  userRole: string;
  userRoles = UserRoles;
  isReviewerLogin: boolean = false;
  tenantId: number = this.appSessionService.tenantId;
  helper = Helper;
  pageError: boolean = false;
  path: string;
  reviewerStatus: number;
  reviewerCommentEnum = ReviewerComment;
  adminQuestionReviewer: boolean = false;
  assessmentReviewers: AssessmentReviewerUserDto[];
  showQnReviewerBtn: boolean = false;
  redirectQnSerialNumber: number;
  isQuestionStatusCompleted: boolean;
  defaultReviewCommentStatus = [Constants.accepted, Constants.rejected, Constants.suggested, Constants.pending];
  selectedReviewCommentStatus: string = '';
  currentQuestionIndex: number;
  isQuestionReadOnly: boolean;
  assessmentSubSkills: SkillDto[] = [];
  assessmentSkills: SkillDto[] = [];
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  skillId?: number;
  subSkillId?: number;
  selectedSkill: SkillDto;
  selectedSubSkill: SkillDto;
  isReplaceQuestion: boolean = false;
  @HostListener('window:keydown', ['$event'])
  function(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
    }
  };

  constructor(private reviewerService: AssessmentReviewService,
    private appSessionService: AppSessionService,
    private activatedRoute: ActivatedRoute,
    private toastrService: ToastrService,
    private dataService: dataService,
    private modalService: NgbModal,
    private router: Router,
    private utilsService: UtilsService) {
  }

  ngOnInit(): void {
    this.path = this.router.url;
    this.getCookieValues();
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        const data = atob(params['id']);
        this.dataService.userRole.subscribe(val => {
          this.userRole = val;
          if (this.userRole === UserRoles[6]) {
            this.isReviewerLogin = true;
          }
          if (data) {
            let queryParamData = data.split('/');
            this.tenantAssessmentReviewId = parseInt(queryParamData[0]);
            this.getAssessmentReviewers();
            if (this.userRole === UserRoles[1]) {
              this.tenantId = parseInt(queryParamData[1]);
            }
          }
        });
      } else {
        this.pageError = true;
      }
    });
    if (this.isReviewerLogin) {
      this.selectedReviewCommentStatus = this.selectedReviewCommentStatus === '' ? '' : this.selectedReviewCommentStatus;
      this.getAssessmentSkills();
    }
  }

  getAssessmentSkills() {
    if (this.tenantAssessmentReviewId) {
      this.reviewerService.getAssessmenSkills(this.tenantAssessmentReviewId).subscribe(res => {
        if (res?.success) {
          this.assessmentSkills = res.result;
        }
      });
    }
  }

  onSkillSelect(event) {
    if (this.tenantAssessmentReviewId && event.id) {
      this.skillId = event.id;
      this.selectedSubSkill = null;
      const data: SubSkillRequestDto = {
        tenantAssessmentReviewId: this.tenantAssessmentReviewId,
        skillId: this.skillId
      };
      this.reviewerService.getAssessmenSubSkills(data).subscribe(res => {
        if (res?.success) {
          this.assessmentSubSkills = res.result;
        }
      });
    }
  }

  resetSubSkills(): void {
    this.skillId = null;
    this.assessmentSubSkills = [];
    this.selectedSkill = null;
    this.selectedSubSkill = null;
    this.subSkillId = null;
    this.getReviewAssessmentQuestion();
  }

  onSubSkillSelect(event): void {
    this.subSkillId = event.id;
    this.onSkillSearch();
  }

  onSubSkillDeSelect(): void {
    this.subSkillId = null;
    this.selectedSubSkill = null;
    this.onSkillSearch();
  }

  getCookieValues() {
    if (this.utilsService.getCookieValue(this.constants.redirectQuestionDetails)) {
      let val = atob(this.utilsService.getCookieValue(this.constants.redirectQuestionDetails)).split('/');
      this.redirectQnSerialNumber = Number(val[0]);
      this.selectedReviewCommentStatus = val[1];
      this.utilsService.deleteCookie(this.constants.redirectQuestionDetails, abp.appPath);
    }
    if (this.utilsService.getCookieValue(this.constants.reviewCommentStatus)) {
      this.selectedReviewCommentStatus = atob(this.utilsService.getCookieValue(this.constants.reviewCommentStatus));
      this.utilsService.deleteCookie(this.constants.reviewCommentStatus, abp.appPath);
    }
  }

  onStatusChange(): void {
    this.resetAssessmentQuestionDetails();
    this.getReviewAssessmentQuestion();
  }

  onSkillSearch() {
    if (this.skillId) {
      this.getReviewAssessmentQuestion();
    }
  }

  resetAssessmentQuestionDetails(): void {
    this.assessmentQuestions = [];
    this.questionsCount = 0;
    this.currentSelectedSection = null;
    this.currentSelectedSectionQuestions = [];
    this.currentQuestion = null;
  }

  getAssessmentReviewers() {
    this.reviewerService.getAllTenantAssessmentReviewers(this.tenantAssessmentReviewId).subscribe(res => {
      if (res && res.success) {
        this.assessmentReviewers = res.result;
        this.checkAssessmentReviewer();
      }
    });
  }

  openAssignReviewModal(isReReview: boolean = false): void {
    const modalRef = this.modalService.open(ReviewQuestionnaireComponent, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.reviewQuestionnaireDto = {
      tenantId: this.tenantId,
      tenantAssessmentReviewId: this.tenantAssessmentReviewId,
      assessmentId: this.assessmentDetails.assessmentId,
      assessmentReviewerId: this.assessmentDetails.assessmentReviewerId,
      isUpdate: true,
      isReReview: isReReview
    };
    modalRef.dismissed.subscribe(result => {
      if (result && result.isReload === true) {
        this.clear();
        this.getReviewAssessmentQuestion();
      }
      if (this.userRole === UserRoles[6] && !result.isClose)
        this.router.navigate([`../../`], { relativeTo: this.activatedRoute });
    },
      error => {
        this.toastrService.error(Constants.somethingWentWrong);
        console.error(error);
      });
  }

  getReviewAssessmentQuestion(isQuestionUpdate?: boolean) {
    let requestData: RequestAssessmentQuestions = {
      tenantAssessmentReviewId: this.tenantAssessmentReviewId,
      reviewerId: this.isReviewerLogin || this.adminQuestionReviewer ? this.appSessionService.userId : null,
      tenantId: this.tenantId,
      reviewCommentStatus: this.selectedReviewCommentStatus,
      skillId: this.skillId,
      subSkillId: this.subSkillId
    };
    this.reviewerService.getReviewAssessmentQuestions(requestData).subscribe(res => {
      if (res && res.success) {
        this.assessmentDetails = res.result;
        this.resetAssessmentQuestionDetails();
        this.assessmentSections = this.assessmentDetails.sections;
        if (this.assessmentSections?.length <= 0 && this.isReviewerLogin) {
          this.toastrService.warning(Constants.noQuestionsFound);
          return;
        }
        this.currentSelectedSection = this.assessmentSections[0];
        this.currentSelectedSectionQuestions = this.assessmentSections[0]?.questions;
        this.assessmentSections?.forEach(section => {
          section.questions.forEach(question => {
            this.questionsCount += 1;
            question.serialNumber = this.questionsCount;
            question.sectionId = section.sectionId;
            question.isReviewerLogin = this.isReviewerLogin;
            question.backgroundColor = this.setBackGroundColor(question?.reviews[0]?.questionReviewStatus);
            question.assessmentId = this.assessmentDetails.assessmentId;
            if (!this.isReviewerLogin)
              question.selectedCommentStatus = this.selectedReviewCommentStatus;
            this.assessmentQuestions.push(question);
          });
        });
        if (isQuestionUpdate && this.reviewerService.lastSelectedQuestion) {
          const question = this.assessmentQuestions.filter(obj => obj.sectionId === this.reviewerService.lastSelectedQuestion.sectionId && obj.questionId === this.reviewerService.lastSelectedQuestion.questionId)[0];
          this.currentSelectedSection = this.assessmentSections.filter(section => section.sectionId === question.sectionId)[0];
          this.currentSelectedSectionQuestions = this.currentSelectedSection.questions;
          this.setLiveSectionAndQuestion(question);
        } else {
          this.setQuestionAndFeedback(this.assessmentQuestions[0]);
        }
        if (this.redirectQnSerialNumber && !this.isReviewerLogin)
          this.setLiveSectionAndQuestion(this.assessmentQuestions?.filter(question => question.serialNumber === this.redirectQnSerialNumber)[0]);
      }
    });
  }

  checkAssessmentReviewer() {
    if (!this.isReviewerLogin) {
      if (this.assessmentReviewers && this.assessmentReviewers.find(x => x.userId === this.appSessionService.userId)) {
        this.adminQuestionReviewer = true;
      }
    }
    this.getReviewAssessmentQuestion();
  }

  onSectionChange(section: AssessmentSections) {
    if (section.sectionId !== this.currentSelectedSection.sectionId) {
      this.currentSelectedSection = section;
      this.currentSelectedSectionQuestions = section.questions;
      this.setQuestionAndFeedback(this.assessmentQuestions.filter(question => question.sectionId === section.sectionId)[0]);
    }
  }

  saveAndMoveOtherQuestion(command: string) {
    if (this.reviewerStatus === this.reviewerCommentEnum.Accept && this.reviewerStatus && this.currentQuestion.isEnableFeedbackOptions) {
      this.checkAndSaveReviewerComments(command);
      return;
    }
    this.feedback = this.feedback === null ? "" : this.feedback;
    if (this.reviewerStatus !== this.reviewerCommentEnum.Accept && this.feedback.trim() && this.currentQuestion?.reviews[0]?.comment !== this.feedback) {
      this.checkAndSaveReviewerComments(command);
    } else if (this.reviewerStatus !== this.reviewerCommentEnum.Accept && this.currentQuestion?.reviews[0]?.comment !== this.feedback && this.feedback.trim() === (null || "")) {
      this.toastrService.warning(Constants.yourFeedbackCannotBeEmpty);
    } else {
      this.questionRedirect(command);
    }
  }

  checkAndSaveReviewerComments(command: string) {
    let data: ReviewerCommentCheckDto = {
      tenantAssessmentReviewId: this.tenantAssessmentReviewId,
      questionId: this.currentQuestion.questionId,
      assessmentReviewerId: this.assessmentDetails.assessmentReviewerId
    };
    this.reviewerService.isAllowedToAddReviewerComment(data).subscribe(res => {
      if (res?.success && res?.result?.isSuccess && res?.result?.errorMessage === ('' || null)) {
        this.saveComments(command);
        return;
      }
      else if (res?.success && res?.result?.isSuccess && res?.result?.errorMessage === (Constants.thisQuestionWasAcceptedBySignoffReviewer)) {
        this.toastrService.warning(res.result.errorMessage);
        const previousQuestion = this.assessmentQuestions[this.assessmentQuestions.indexOf(this.currentQuestion) - 1];
        const nextQuestion = this.assessmentQuestions[this.assessmentQuestions.indexOf(this.currentQuestion) + 1];
        this.removeQuestionFromBucket();
        this.setLiveSectionAndQuestion(nextQuestion ? nextQuestion : previousQuestion);
      }
      else if (res?.success && res?.result?.isSuccess && res?.result?.errorMessage !== ('' || null)) {
        this.toastrService.warning(res.result.errorMessage);
      }
      else {
        this.toastrService.error(this.constants.somethingWentWrong);
      }
    });
  }

  questionRedirect(command: string) {
    if (command === Constants.next) {
      this.onNextQuestion();
    } else if (command === Constants.prev) {
      this.onPreviousQuestion();
    }
  }

  onNextQuestion() {
    const nextQuestion = this.assessmentQuestions[this.assessmentQuestions.indexOf(this.currentQuestion) + 1];
    if (nextQuestion)
      this.setLiveSectionAndQuestion(nextQuestion);
  }

  onPreviousQuestion() {
    const previousQuestion = this.assessmentQuestions[this.assessmentQuestions.indexOf(this.currentQuestion) - 1];
    if (previousQuestion)
      this.setLiveSectionAndQuestion(previousQuestion);
  }

  setLiveSectionAndQuestion(question: Questions) {
    if (question) {
      if (question.sectionId !== this.currentQuestion?.sectionId) {
        this.currentSelectedSection = this.assessmentSections.filter(section => section.sectionId === question.sectionId)[0];
        this.currentSelectedSectionQuestions = this.currentSelectedSection.questions;
      }
      this.setQuestionAndFeedback(question);
    }
  }

  setQuestionAndFeedback(question: Questions) {
    if (question) {
      if (this.assessmentDetails?.reviewStatus !== this.questionReviewStatus.SignedOff && !this.isReviewerLogin) {
        question.isEnableQuestionDelete = true;
      }
      this.currentQuestion = question;
      this.currentQuestionIndex = this.assessmentQuestions.indexOf(this.currentQuestion);
      if (this.assessmentDetails?.reviewStatus !== this.questionReviewStatus.SignedOff) {
        this.reviewerStatus = !this.currentQuestion.isEnableFeedbackOptions ? this.currentQuestion.currentReviewerQuestionStatus : null;
      }

      if (this.assessmentDetails?.reviewStatus !== this.questionReviewStatus.SignedOff && this.currentQuestion.isEnableQuestionEdit) {
        this.currentQuestion.isEnableQuestionEdit = true;
      } else {
        this.currentQuestion.isEnableQuestionEdit = false;
      }
    }
  }

  setBackGroundColor(reviewerStatus: number) {
    switch (reviewerStatus) {
      case this.reviewerCommentEnum.Accept:
        return Constants.backgroundColorAccepted;
      case this.reviewerCommentEnum.Reject:
        return Constants.backgroundColorRejected;
      case this.reviewerCommentEnum.Suggest:
        return Constants.backgroundColorSuggested;
      default:
        return Constants.backgroundColorPending;
    }
  }

  saveComments(command: string) {
    let requestData: ReviewCommentsDto = {
      id: 0,
      tenantId: this.appSessionService.tenantId,
      assessmentReviewerId: this.assessmentDetails.assessmentReviewerId,
      questionId: this.currentQuestion.questionId,
      comments: this.reviewerStatus !== this.reviewerCommentEnum.Accept && this.feedback ? this.feedback : '',
      questionReviewStatus: this.reviewerStatus,
      tenantAssessmentReviewId: this.assessmentDetails.tenantAssessmentReviewId
    };

    this.reviewerService.insertOrUpdateComments(requestData).subscribe(res => {
      if (res.success) {
        this.setCommentsAndId(res.result, this.currentQuestion.questionId, this.appSessionService.userId);
        this.toastrService.success(Constants.feedbackAddedSuccessfully);
        const previousQuestion = this.assessmentQuestions[this.assessmentQuestions.indexOf(this.currentQuestion) - 1];
        const nextQuestion = this.assessmentQuestions[this.assessmentQuestions.indexOf(this.currentQuestion) + 1];
        if (this.isReviewerLogin) {
          this.removeQuestionFromBucket();
        }
        this.setLiveSectionAndQuestion(nextQuestion ? nextQuestion : previousQuestion);
      }
    });
  }

  removeQuestionFromBucket() {
    this.currentSelectedSection.questions.splice(this.currentSelectedSection.questions.indexOf(this.currentQuestion), 1);
    this.currentSelectedSectionQuestions = this.currentSelectedSection.questions;
    this.assessmentQuestions.splice(this.assessmentQuestions.indexOf(this.currentQuestion), 1);
    this.currentQuestionIndex = this.assessmentQuestions.indexOf(this.currentQuestion);
    if (!this.assessmentQuestions?.length) {
      this.assessmentSections = [];
      this.currentQuestionIndex = this.currentQuestion = null;
      this.CheckSignOff();
      this.toastrService.warning(Constants.youHaveSubmittedFeedbackForAllQuestionsNoQuestionIsAvailableToReview);
    }
  }

  CheckSignOff() {
    let requestData: RequestAssessmentQuestions = {
      tenantAssessmentReviewId: this.tenantAssessmentReviewId,
      reviewerId: this.isReviewerLogin || this.adminQuestionReviewer ? this.appSessionService.userId : null,
      tenantId: this.tenantId,
      reviewCommentStatus: '',
      skillId: this.skillId,
      subSkillId: this.subSkillId
    };
    this.reviewerService.getReviewAssessmentQuestions(requestData).subscribe(res => {
      if (res && res.success) {
        this.assessmentDetails = res.result;
      }
    });
  }

  setCommentsAndId(reviewCommentId: number, questionId: number, reviewerId: number) {
    let review: QuestionReviews = {
      reviewCommentId: reviewCommentId,
      questionId: questionId,
      reviewerId: reviewerId,
      comment: this.feedback,
      reviewerName: this.appSessionService.user.emailAddress,
      questionReviewStatus: this.reviewerStatus
    };
    this.currentQuestion.isEnableFeedbackOptions = false;
    this.currentQuestion.reviews.unshift(review);
  }

  enableAdminReply(review: QuestionReviews, isEnable: boolean) {
    if (isEnable) {
      let replyEnabledComments = this.currentQuestion.reviews.filter(x => x.enableAdminReply === true);
      replyEnabledComments.forEach(comment => {
        comment.enableAdminReply = false;
      });
    }
    review.enableAdminReply = isEnable;
  }

  saveAdminReviewerComments(review: QuestionReviews) {
    this.reviewerStatus = this.reviewerCommentEnum.AdminReply;
    this.feedback = !this.feedback ? "" : this.feedback.trim();
    if (this.reviewerStatus && !this.feedback) {
      this.toastrService.warning(Constants.pleaseEnterAReply);
      return;
    }
    let requestData: ReviewCommentsDto = {
      id: 0,
      tenantId: this.appSessionService.tenantId,
      assessmentReviewerId: this.assessmentDetails.assessmentReviewerId,
      questionId: this.currentQuestion.questionId,
      comments: this.feedback,
      questionReviewStatus: this.reviewerStatus,
      tenantAssessmentReviewId: this.assessmentDetails.tenantAssessmentReviewId,
      parentReviewCommentId: review.reviewCommentId
    };
    this.reviewerService.insertOrUpdateComments(requestData).subscribe(res => {
      if (res.success) {
        let adminReplyDto: AdminReplyDto = {
          reviewerId: this.appSessionService.userId,
          reviewerName: this.appSessionService.user.userName,
          comment: this.feedback
        };
        review.adminReply = adminReplyDto;
        review.enableAdminReply = false;
        this.feedback = '';
        this.reviewerStatus = null;
        this.toastrService.success(Constants.feedbackAddedSuccessfully);
      }
    });
  }

  resetFeedback(): void {
    this.feedback = "";
  }

  l(key: string, ...args: any[]): string {
    return abp.utils.formatString.apply(this, args);
  }

  submitReview(status: number) {
    this.reviewerService.checkReviewSignOffCriteria(this.tenantAssessmentReviewId)
      .subscribe((res) => {
        if (res.success && res.result?.isSuccess) {
          this.signOffReview(status, res.result.warningMessage);
        }
        if (res.success && !res.result.isSuccess)
          this.toastrService.warning(this.constants.unableToProvideSignOff + res.result?.warningMessage);
      });
  }

  signOffReview(status: number, message: string) {
    abp.message.confirm(
      this.l('ReviewSubmitConfirmationMessage', `${message}`),
      (result: boolean) => {
        if (result) {
          let requestData: UpdateReviewStatusDto = {
            tenantAssessmentReviewId: this.tenantAssessmentReviewId,
            status: status,
            reviewerName: this.appSessionService.user.name
          };
          this.reviewerService.updateReviewStatus(requestData).subscribe(res => {
            if (res.success) {
              this.assessmentDetails.reviewStatus = status;
              if (status === QuestionReviewStatus.SignedOff)
                this.toastrService.success(Constants.signOffProvidedSuccessfully);
              this.router.navigate([`../../`], { relativeTo: this.activatedRoute });
            }
          });
        }
      });
  }

  clear(): void {
    this.questionsCount = 0;
    this.assessmentQuestions = [];
  }

  onQuestionRemove(event) {
    this.isReplaceQuestion = this.utilsService.getCookieValue(this.constants.isReplaceQuestion) === 'true' ? true : false;
    if (event) {
      if (this.isReplaceQuestion) {
        abp.message.confirm(
          this.l('UpdateAssessmentQuestionWarning', Constants.areYouSureYouWantToUpdateTheQuestion),
          (result: boolean) => {
            if (result) {
              const index = this.assessmentQuestions[this.assessmentQuestions.indexOf(this.currentQuestion) + 1] ? this.assessmentQuestions.indexOf(this.currentQuestion) + 1 : this.assessmentQuestions.indexOf(this.currentQuestion) - 1;
              this.reviewerService.lastSelectedQuestion = this.assessmentQuestions[index];
              const modalRef = this.modalService.open(AssessmentOperationComponent, {
                centered: true,
                backdrop: 'static',
                size: 'lg'
              });
              modalRef.componentInstance.assessmentData = {
                callFrom: Constants.adminQuestionReviewer,
                action: Constants.editSkill,
                assessmentId: this.assessmentDetails.assessmentId,
                categoryIds: this.assessmentDetails.categories.map(x => x.id),
                assessmentSectionId: this.currentQuestion.sectionId,
                assessmentSectionSkillId: this.currentQuestion.assessmentSectionSkillId,
                assessmentName: this.assessmentDetails.assessmentName,
                categories: this.assessmentDetails.categories.map(x => x.name).join(', '),
                questionId: this.currentQuestion.questionId
              };
              modalRef.dismissed.subscribe(result => {
                if (result) {
                  this.sortQuestions();
                }
              },
                error => {
                  this.toastrService.error(Constants.somethingWentWrong);
                });
            }
            else {
              this.utilsService.deleteCookie(this.constants.isReplaceQuestion, abp.appPath);
              this.utilsService.deleteCookie(this.constants.reviewCommentId, abp.appPath);
              this.utilsService.deleteCookie(this.constants.isSkillChange, abp.appPath);
            }
          });
      }
      else {
        abp.message.confirm(
          this.l('DeleteAssessmentQuestionWarning', Constants.areYouSureYouWantToDeleteTheQuestion),
          (result: boolean) => {
            if (result) {
              let data: updateSections = {
                assessmentId: this.assessmentDetails.assessmentId,
                assessmentSectionId: this.currentQuestion.sectionId,
                assessmentSectionSkillId: this.currentQuestion.assessmentSectionSkillId,
                removedQuestionId: this.currentQuestion.questionId
              };
              this.reviewerService.updateSectionQuestionsAsync(data).subscribe(res => {
                if (res.result) {
                  this.toastrService.success(Constants.questionDeletedSuccessful);
                  this.sortQuestions();
                }
                else {
                  this.toastrService.error(Constants.somethingWentWrong);
                }
              });
            }
          });
      }
    }
  }

  sortQuestions() {
    this.getReviewAssessmentQuestion(true);
    this.questionsCount = 0; this.assessmentQuestions = [];
    this.currentQuestion = this.reviewerService.lastSelectedQuestion ? this.currentQuestion : null;
  }

  redirectToDashboard(tenantAssessmentReviewId: number, assessmentId: number): void {
    this.router.navigate([`../../review-dashboard`, btoa(JSON.stringify(tenantAssessmentReviewId)), btoa(JSON.stringify(assessmentId))], { relativeTo: this.activatedRoute });
  }
}