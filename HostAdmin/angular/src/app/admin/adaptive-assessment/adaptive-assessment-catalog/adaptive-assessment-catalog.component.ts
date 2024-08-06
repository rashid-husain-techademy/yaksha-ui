import { Component, OnInit } from '@angular/core';
import { AdaptiveAssessmentDetails, AdaptiveAssessmentFilter, AdaptiveAssessmentList, TenantList, tenantDetailsDto } from '../adaptive-assessment';
import { UserRoles } from '@app/enums/user-roles';
import { Constants } from '@app/models/constants';
import { FormGroup } from '@angular/forms';
import { Helper } from '@app/shared/helper';
import { MultiSelectDropdownSettings } from '@app/interface/multi-select-dropdown';
//import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AppSessionService } from '@shared/session/app-session.service';
import { dataService } from '@app/service/common/dataService';
import { AdaptiveAssessmentService } from '../adaptive-assessment.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-adaptive-assessment-catalog',
  templateUrl: './adaptive-assessment-catalog.component.html',
  styleUrls: ['./adaptive-assessment-catalog.component.scss']
})
export class AdaptiveAssessmentCatalogComponent implements OnInit {
  tenantList: TenantList[];
  adaptiveAssessmentList: AdaptiveAssessmentDetails;
  userRoles = UserRoles;
  pageSizes: number[] = [10, 20, 30];
  pageIndex = 1;
  pageSize = 10;
  maxSize: number = 5;
  selectedTenantId: number | null = null;
  editAddLabel: string = 'Edit';
  constants = Constants;
  selectedTenant: any;
  userRole: string;
  tenantForm: FormGroup;
  tenant: any;
  helper = Helper;
  searchString: string = "";
  noAssessmentsFound: boolean = false;
  //userFilter: UserFilter;
  tenantDetails: tenantDetailsDto[];
  singleDropdownSettings: MultiSelectDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true
  };
  constructor(
    // private modalService: NgbModal,
    private adaptiveAssessmentService: AdaptiveAssessmentService,
    private toastrService: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appSessionService: AppSessionService,
    private dataService: dataService,
  ) {
  }

  ngOnInit(): void {
    this.getAllTenants();
    this.getAdaptiveAssessment();
  }

  getAllTenants() {
    this.dataService.userRole.subscribe(val => {
      this.userRole = val;
    });

    if (this.userRole === UserRoles[1]) {
      this.adaptiveAssessmentService.getAllTenants().subscribe(res => {
        if (res.success) {
          this.tenantList = res.result;
        }
        else {
          this.toastrService.warning(Constants.noTenantsFound);
        }
      });
    }
    else {
      this.selectedTenantId = this.appSessionService.tenantId;
      this.getAdaptiveAssessment();
    }
  }
  getAdaptiveAssessment() {
    this.noAssessmentsFound = false;
    let data: AdaptiveAssessmentFilter = {
      tenantId: this.selectedTenantId,
      skipCount: (this.pageIndex - 1) * this.pageSize,
      maxResultCount: this.pageSize,
      searchString: this.searchString
    };
    this.adaptiveAssessmentService.getAdaptiveAssessment(data).subscribe(res => {
      if (res.success) {
        this.adaptiveAssessmentList = res.result;
      }
      if(res.result.totalCount === 0){
        this.noAssessmentsFound = true;
      }
      else {
        this.pageIndex = 1;
      }
    });
  }
  searchAdaptiveAssessment(){
    if(this.searchString !== ""){
      this.getAdaptiveAssessment();
    }
  }
  getTenantAdaptiveAssessment(event: any) {
    let tenantId = event.id;
    this.tenantDetails = [{
      id: event.id,
      name: event.name
    }];
    if (tenantId && tenantId !== this.constants.selectTenant) {
      this.selectedTenantId = tenantId;
    }
    else
      this.selectedTenantId = null;
    this.getAdaptiveAssessment();
  }
  loadPage() {
    this.getAdaptiveAssessment();
  }

  changePageSize() {
    this.pageIndex = 1;
    this.getAdaptiveAssessment();
  }
  search(event: any): void {
    this.pageIndex = 1;
    this.searchString = event.target.value;
    this.getAdaptiveAssessment();
  }
  schedule(adaptiveAssessment: AdaptiveAssessmentList) {
    this.router.navigate([`../adaptive-assessment-schedule`, btoa(JSON.stringify(adaptiveAssessment)),], { relativeTo: this.activatedRoute });
  }
  reset(): void {
    this.selectedTenantId = null;
    this.tenantDetails = [];
    this.pageIndex = 1;
    this.searchString = '';
    this.getAllTenants();
    this.getAdaptiveAssessment();
  }

  viewAssessment(assessmentId) {
    this.router.navigate([`../view-adaptive-assessment`, btoa(JSON.stringify(assessmentId)),], { relativeTo: this.activatedRoute });
  }

}
