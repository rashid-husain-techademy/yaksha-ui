import { Injectable } from '@angular/core';
import { ApiClientService } from '@app/service';
import { Result } from '@app/shared/core-interface/base';
import { Helper } from '@app/shared/helper';
import { Observable } from 'rxjs';
import { DashboardData, DashboardEmbedData } from './analytics';

const routes = {
    getDashboard: "yaksha/Dashboard/GetDashboard"
};

@Injectable({
    providedIn: 'root'
})

export class AnalyticsService {

    constructor(private apiClient: ApiClientService) { }

    getDashboard(data: DashboardData): Observable<Result<DashboardEmbedData>> {
        return this.apiClient.get(routes.getDashboard, Helper.httpParamBuilder(data));
    }
}
