import { Component, ElementRef, ViewChild } from '@angular/core';
import { Constants } from '@app/models/constants';
import { AssessmentService } from '../assessment.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-bulk-assessment-schedule',
  templateUrl: './bulk-assessment-schedule.component.html',
  styleUrls: ['./bulk-assessment-schedule.component.scss']
})
export class BulkAssessmentScheduleComponent {
  constants = Constants;
  showErrors: boolean = false;
  fileTypeGranted = false;
  file: File;
  bulkScheduleFilePath: string = "assets/sampleTemplate/Bulk_Assessment_Schedule.xlsx";
  fileName: string;
  @ViewChild('fileInput') fileInput: ElementRef;
  errorMessage: string[] = [];

  constructor(private assessmentService: AssessmentService,
    private toastr: ToastrService,
  ) { }

  onFileChange(files) {
    this.file = files[0];
    this.fileName = files[0].name;
    this.fileTypeGranted = true;
  }

  uploadFile() {
    this.fileTypeGranted = this.showErrors = false;
    this.errorMessage = [];
    const formData = new FormData();
    formData.append('file', this.file, this.file.name);
    const timezone = 'India Standard Time';
    formData.append('timezone', timezone);
    this.assessmentService.bulkAssessmentSchedule(formData).subscribe(res => {
      if (res.result?.length > 0) {
        this.showErrors = true;
        this.errorMessage = res.result;
      } else {
        this.toastr.success(Constants.scheduleCreationInProgressUserWillReceiveMailOnceCompleted);
        this.clearData();
      }
    });
  }

  removeSelectedFile(): void {
    this.clearData();
    this.toastr.warning(Constants.selectedFileWasRemoved);
  }

  clearData() {
    this.fileInput.nativeElement.value = '';
    this.file = null;
    this.fileName = '';
    this.showErrors = false;
    this.errorMessage = [];
  }

}
