import { Component, OnInit } from '@angular/core';
import { Constants } from '@app/models/constants';
import { TenantsService } from '../../tenants.service';
import { ActivatedRoute } from '@angular/router';
import { FileUploadComponent } from '@app/admin/shared/file-upload/file-upload.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadType, UploadType } from '@app/enums/file-upload-type';
import { AppSessionService } from '@shared/session/app-session.service';
import { TenantCustomizationSettings } from '../../tenant-detail';
import { dataService } from '@app/service/common/dataService';

@Component({
  selector: 'app-tenant-customization',
  templateUrl: './tenant-customization.component.html',
  styleUrls: ['./tenant-customization.component.scss']
})
export class TenantCustomizationComponent implements OnInit {
  constants = Constants;
  tenantId: number = this.appSessionService.tenantId;
  file: FormData;
  tenantLogoUrl: string;

  constructor(
    private appSessionService: AppSessionService,
    private tenantService: TenantsService,
    private dataService: dataService,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal) { }

  ngOnInit(): void {
      this.activatedRoute.params.subscribe(params => {
        if (params && params['id']) {
          this.tenantId = +atob(params['id']);
        }  
      });
    this.getTenantCustomizationSettings();
  }

  getTenantCustomizationSettings() {
    this.tenantService.getTenantCustomizationSettings(this.tenantId).subscribe(res => {
      if (res && res.result) {
        let customizationSettings = JSON.parse(res.result) as TenantCustomizationSettings;
        this.tenantLogoUrl = customizationSettings.TenantLogoUrl;
      }
    }, error => {
      console.error(error);
    });
  }
  
  openImageUploadDialog() {
    const modalRef = this.modalService.open(FileUploadComponent, {
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.fileUploadData = {
      title: "Update Tenant Logo",
      supportedTypes: ["image/jpg", "image/jpeg", "image/png"],
      uploadType: UploadType.ImageUpload,
      subUploadType: FileUploadType.TenantLogo,
      supportedTypesMessage: Constants.onlyPngJpgFilesAreAcceptedWithSize,
      tenantId: this.tenantId,
      existingImageUrl: this.tenantLogoUrl,
      errorMessage: Constants.onlyPngJpgFilesAreAccepted,
    };
    modalRef.dismissed.subscribe(result => {
      if (result) {
        this.getTenantCustomizationSettings();
        if (this.appSessionService.tenantId) {
          this.dataService.setTenantLogoUpdated(true);
        }
      }
    });
  }
 }
