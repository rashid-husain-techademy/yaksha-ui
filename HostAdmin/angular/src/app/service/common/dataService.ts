import { Injectable } from '@angular/core';
import { UserRoles } from '@app/enums/user-roles';
import { BehaviorSubject } from 'rxjs';
import { UserDto } from '@app/admin/users/users';
import { CountdownComponent } from 'ngx-countdown';

@Injectable({
  providedIn: 'root'
})
export class dataService {
  private _userRole = new BehaviorSubject("");
  userRole = this._userRole.asObservable();
  isMakeMyLabsInUse: boolean = false;
  connectionFailed: boolean = false;
  calculateDuration: NodeJS.Timeout;
  calculateDurationMilliseconds: NodeJS.Timeout;
  autoSaveCall: NodeJS.Timeout;
  private _customArgs = new BehaviorSubject("");
  customArgs = this._customArgs.asObservable();
  private _ideLaunched = new BehaviorSubject(false);
  ideLaunched = this._ideLaunched.asObservable();
  userProfile: UserDto;
  private _userRegisterData = new BehaviorSubject("");
  private _token = new BehaviorSubject("");
  userRegisterData = this._userRegisterData.asObservable();
  token = this._token.asObservable();
  private _userPermissions = new BehaviorSubject([{ "": true }]);
  userPermissions = this._userPermissions.asObservable();
  private _isTenantLogoUpdated = new BehaviorSubject(false);
  isTenantLogoUpdated = this._isTenantLogoUpdated.asObservable();
  dxcId: number = 78;
  tataCommunicationsId: number = 62;
  mahindraFinanceId: number = 296;
  wellsfargoId: number = 21;
  berkadiaId: number = 299;
  socgenYaksha: number = 307;
  capgemini: number = 314;
  //------DXC Tenants------//
  dxclateralnetworkingId: number = 339;
  dxclateralId: number = 342;
  dxcfreshersId: number = 344;
  dxcpreassessmentId: number = 398;
  dxclateralYakshaId: number = 399;
  //----------------------------//
  cognizantyakshaId: number = 349;
  abinbevId: number = 246;
  evoketechnologiesId: number = 465;
  //-----Godigit Tenants-----//
  godigitId: number = 311;
  gogdigitYakshaId: number = 428;
  //-----Wipro Tenants-----//
  wiproId: number = 52;
  //-----Amdocs Tenants-----//
  amdocsId: number = 15;
  //----ltimindtreeyaksha Tenants----//
  ltimindtreeyakshaId: number = 505;
  //----QuinnoxYaksha Tenant----//
  quinnoxyakshaId: number = 516;
  //----NSEIT Tenant----//
  nseitId: number = 518;
  //----Brillio Tenant----//
  brillioId: number = 517;
  //----HSBC Tenant----//
  hsbcId: number = 577;
  //-----Gurukashi Tenant----//
  gurukashiId: number = 598;

  //Virtusastd tenant
  virtusastdId: number = 279;
  //Techvasi tenant
  techvasiId: number = 620;
  //Zikshaa	tenant
  zikshaaId: number = 621;


  //=---Infosys----//
  isInfosys: number = 123;
  //-----NITTE Tenant----//
  nitte: number = 587;
  ltim: number = 543;
  //-----CognizantYaksha Tenant----//
  cognizantYakshaId: number = 349;

  isSaveAndExit: boolean;
  countDown: CountdownComponent;
  timeRecords: Map<number, { startTime: number, timeSpent: number, previousTimeSpent: number }> = new Map();


  constructor() { }

  setUserRole(role: string) {
    this._userRole.next(role);
  }

  setUserRegisterData(args: string) {
    this._userRegisterData.next(args);
  }

  setUserPermissions(data: any) {
    this._userPermissions.next(data);
  }

  setToken(args: string) {
    this._token.next(args);
  }

  setCustomArgs(args: string) {
    this._customArgs.next(args);
  }

  setIdeLaunched(value: boolean) {
    this._ideLaunched.next(value);
  }

  setTenantLogoUpdated(value: boolean) {
    this._isTenantLogoUpdated.next(value);
  }

  isZikshaaTenant(tenantId: number): boolean {
    if (tenantId === this.zikshaaId)
      return true;
    else
      return false;
  }
  isVirtusastdTenant(tenantId: number): boolean {
    if (tenantId === this.virtusastdId)
      return true;
    else
      return false;
  }
  isTechvasiIdTenant(tenantId: number): boolean {
    if (tenantId === this.techvasiId)
      return true;
    else
      return false;
  }
  isHsbcTenant(tenantId: number): boolean {
    if (tenantId === this.hsbcId)
      return true;
    else
      return false;
  }

  isGurukashiTenant(tenantId: number): boolean {
    if (tenantId === this.gurukashiId)
      return true;
    else
      return false;
  }
  isCognizantYakshaTenant(tenantId: number): boolean {
    if (tenantId === this.cognizantYakshaId)
      return true;
    else
      return false;
  }

  private checkUserRole(roleIdentifier: number): boolean {
    let status: boolean = null;
    this.userRole.subscribe(roles => {
      if (roles === UserRoles[roleIdentifier]) {
        status = true;
      }
    }, err => {
      status = false;
    });
    return status;
  }

  isSuperAdmin(): boolean {
    return this.checkUserRole(1);
  }

  isTenantAdmin(): boolean {
    return this.checkUserRole(2);
  }

  checkCustomTheme(tenantId: number): boolean {
    switch (tenantId) {
      case this.nseitId:
        return true;
      default:
        return false;
    }
  }

  checkCustomThemeForAbinBev(tenantId: number): boolean {
    switch (tenantId) {
      case this.abinbevId:
        return true;
      default:
        return false;
    }
  }

  checkTenantId(tenantId: number): string {
    switch (tenantId) {
      case this.isInfosys:
        return 'Infosys';
      default:
        return '';
    }
  }

  checkTenant(tenantId: number): string {
    switch (tenantId) {
      case this.dxcId:
        return 'assets/images/dxc-logo.png';
      case this.mahindraFinanceId:
        return 'assets/images/mahindra-finance-logo.png';
      case this.tataCommunicationsId:
        return 'assets/images/tatacommunications-logo.png';
      case this.wellsfargoId:
        return 'assets/images/wellsfargo-logo.png';
      case this.berkadiaId:
        return 'assets/images/berkadia-logo.png';
      case this.socgenYaksha:
        return 'assets/images/societe-generale-logo.png';
      case this.capgemini:
        return 'assets/images/capgemini-logo.png';
      case this.dxclateralnetworkingId:
        return 'assets/images/dxc-logo.png';
      case this.dxclateralId:
        return 'assets/images/dxc-logo.png';
      case this.dxcfreshersId:
        return 'assets/images/dxc-logo.png';
      case this.dxcpreassessmentId:
        return 'assets/images/dxc-logo.png';
      case this.dxclateralYakshaId:
        return 'assets/images/dxc-logo.png';
      case this.cognizantyakshaId:
        return 'assets/images/cognizant.png';
      case this.abinbevId:
        return 'assets/images/abinbevId.png';
      case this.godigitId:
        return 'assets/images/godigit-logo.png';
      case this.gogdigitYakshaId:
        return 'assets/images/godigit-logo.png';
      case this.evoketechnologiesId:
        return 'assets/images/evoketechnologies-logo.png';
      case this.wiproId:
        return 'assets/images/wipro-logo.png';
      case this.amdocsId:
        return 'assets/images/amdocs-logo.png';
      case this.ltimindtreeyakshaId:
        return 'assets/images/ltimindtreeyaksha-logo.png';
      case this.quinnoxyakshaId:
        return 'assets/images/quinnoxyaksha-logo.jpg';
      case this.nseitId:
        return 'assets/images/NSEIT-DeX-logo-white.png';
      case this.brillioId:
        return 'assets/images/brillio-logo.png';
      default:
        return 'assets/images/yaksha-logo.png';
    }
  }

  isDxclateralYakshaTenant(tenantId: number): boolean {
    if (tenantId === this.dxclateralYakshaId)
      return true;
    else
      return false;
  }

  startTimer(questionId: number): void {
    const currentTime = performance.now();
    const timeRecord = this.timeRecords.get(questionId);
    if (timeRecord && (timeRecord.previousTimeSpent != undefined || timeRecord.previousTimeSpent != null)) {
      const { timeSpent, previousTimeSpent } = timeRecord;
      this.timeRecords.set(questionId, { startTime: currentTime, timeSpent, previousTimeSpent });
    } else {
      this.timeRecords.set(questionId, { startTime: currentTime, timeSpent: 0, previousTimeSpent: 0 });
    }
  }

  stopTimer(questionId: number): void {
    const currentTime = performance.now();
    const timeRecord = this.timeRecords.get(questionId);
    if (timeRecord && timeRecord.startTime !== null) {
      const elapsedTime = currentTime - timeRecord.startTime;
      const totalTime = timeRecord.previousTimeSpent + elapsedTime;
      const spentTime = timeRecord.timeSpent + elapsedTime;
      this.timeRecords.set(questionId, {
        startTime: null,
        timeSpent: spentTime,
        previousTimeSpent: totalTime
      });
    }
  }

  getTimeSpent(questionId: number): number {
    const timeRecord = this.timeRecords.get(questionId);
    return timeRecord.previousTimeSpent;
  }
}