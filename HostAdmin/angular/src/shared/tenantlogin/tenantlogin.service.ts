import { Injectable } from '@angular/core';
import { ApiClientService } from '@app/service/common/api-client.service';


const routes = {
  getIDRoute: 'api/services/platform/Tenant/GetIDProvider?id=ca'
};

@Injectable({
  providedIn: 'root'
})
export class TenantloginService {

  constructor(private apiClient: ApiClientService) { }

  getIDRoute(): void {
    this.apiClient;
  }
}
