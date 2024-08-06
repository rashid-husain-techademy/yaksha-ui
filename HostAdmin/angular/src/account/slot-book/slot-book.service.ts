import { Injectable } from '@angular/core';
import { Result } from '@app/shared/core-interface/base';
// import { Helper } from '@app/shared/helper';
import {SlotBookResultDto} from './slot-book-details';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../app/service/common/api-client.service';


const routes = {
  getBookedSlotList: "yaksha/UserAssessment/GetRegistrationDetailsByScheduleId",
  bookSlot:"yaksha/UserAssessment/RegisterUser",
  validateSlotRegisteration:'yaksha/UserAssessment/ValidateSlotRegistrationAsync',
  resendEmail:'yaksha/UserAssessment/ResendInvitation'

}

@Injectable({
  providedIn: 'root'
})
export class SlotBookService {

  constructor(private apiClient:ApiClientService) { 
  }
  getBookedSlotList(assessmentScheduleId:number,tenantId:number):Observable<Result<string>>{
    return this.apiClient.get(routes.getBookedSlotList + "?assessmentScheduleIdNumber=" + assessmentScheduleId + "&tenantId=" + tenantId);
  }
  bookSlot(data): Observable<Result<SlotBookResultDto>> {
    return this.apiClient.postFile(routes.bookSlot, data);
  }
  validateSlotRegisteration(assessmentScheduleIdNumber:string,emailAddress:string,tenantId:number){
    return this.apiClient.postFile(routes.validateSlotRegisteration + "?assessmentScheduleIdNumber=" + assessmentScheduleIdNumber + "&tenantId=" + tenantId + "&emailAddress=" + emailAddress);
  }
  resendEmail(assessmentScheduleIdNumber:string,emailAddress:string,passcode:any,tenantId:number){
    return this.apiClient.postFile(routes.resendEmail + "?assessmentScheduleIdNumber=" + assessmentScheduleIdNumber + "&passcode=" + passcode + "&emailAddress=" + emailAddress + "&tenantId=" + tenantId);
  }
}
