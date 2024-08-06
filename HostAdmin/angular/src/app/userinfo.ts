import { AppSessionService } from '@shared/session/app-session.service';
import { Injectable } from "@angular/core";
@Injectable()
export class UserInfo {
    public tenantId: number;
    public tenantName: string;
    public userId: number;
    public userName: string;

    constructor(private appSession: AppSessionService) {
        this.tenantId = this.appSession.user.tenantId;
        this.tenantName = this.appSession.tenantName;
        this.userId = this.appSession.user.id;
        this.userName = this.appSession.user.userName;
    }
}