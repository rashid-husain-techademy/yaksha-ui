import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateCatalogComponent } from '../create-catalog/create-catalog.component';
import { CatalogService } from '../catalog.service';
import { CatalogDetailsResult, cataLogList } from '../catalog-details';
import { Constants } from '@app/models/constants';
import { ToastrService } from 'ngx-toastr';
import { AppComponentBase } from '@shared/app-component-base';
import { SelfCatalogEnrollmentComponent } from '@app/self-catalog-enrollment/self-catalog-enrollment.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-manage-catalog',
  templateUrl: './manage-catalog.component.html',
  styleUrls: ['./manage-catalog.component.scss']
})
export class ManageCatalogComponent extends AppComponentBase implements OnInit, OnDestroy {
  catalogList: cataLogList;
  constants = Constants;
  pageIndex: number = 1;
  pageSize: number = 10;
  maxSize: number = 5;
  catalogPageSizes: number[] = [10, 20, 30];
  selfCatalog: boolean = false;

  constructor(private modalService: NgbModal,
    private catalogService: CatalogService,
    private toastrService: ToastrService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.getCatalogList();
  }

  createCatalog() {
    const modalRef = this.modalService.open(CreateCatalogComponent, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    });
    modalRef.dismissed.subscribe(result => {
      if (result) {
        this.toastrService.success(Constants.catalogCreatedSuccessfully);
        this.getCatalogList();
      }
    });
  }

  assignUsers(catalog: CatalogDetailsResult) {
    const modalRef = this.modalService.open(SelfCatalogEnrollmentComponent, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.catalogDetails = catalog;
    modalRef.dismissed.subscribe(result => {
      if (result) {
        this.toastrService.success(Constants.catalogAssignedSuccessfully);
        this.catalogList = null;
        this.getCatalogList();
      }
    });
    this.selfCatalog = true;
  }

  viewGroupUser(catalogId: number, groupId: number, tenantId: number) {
    let queryParam = catalogId + '/' + groupId + '/' + tenantId;
    this.router.navigate(['../view-group-users', btoa(queryParam.toString())], { relativeTo: this.activateRoute });
  }

  getCatalogList() {
    const data = {
      skipCount: (this.pageIndex - 1) * this.pageSize,
      maxResultCount: this.pageSize,
    };
    this.catalogService.getCatalog(data).subscribe((res) => {
      if (res && res.result && res.result) {
        this.catalogList = res.result;
      }
    });
  }

  editCatalog(catalog: CatalogDetailsResult) {
    const modalRef = this.modalService.open(CreateCatalogComponent, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.catalogDetails = catalog;
    modalRef.dismissed.subscribe(result => {
      if (result) {
        this.toastrService.success(Constants.catalogUpdatedSuccessfully);
        this.getCatalogList();
      }
    });
  }

  deleteCatalog(catalog: CatalogDetailsResult) {
    abp.message.confirm(
      this.l('TenantDeleteWarningMessage', `${Constants.areYouSureYouWantToDelete} "${catalog.catalogName}"?`),
      (result: boolean) => {
        if (result) {
          this.catalogService.deleteCatalog(catalog.catalogId, catalog.assignedTenantId).subscribe(res => {
            if (res.success) {
              this.toastrService.success(Constants.catalogDeletedSuccessfully);
              this.getCatalogList();
            }
            else {
              this.toastrService.error(Constants.somethingWentWrong);
            }
          },
            err => {
              this.toastrService.error(Constants.somethingWentWrong);
            }
          );
        }
      });
  }

  changePageSize() {
    this.pageIndex = 1;
    this.getCatalogList();
  }

  ngOnDestroy() {
    this.modalService.dismissAll();
  }
}
