export interface slotBookDetails{
    firstName: string,
    lastName: string
    email:string,
    phoneNumber: number,
    gender: string,
    dateOfBirth:string,
    // slot: string,
    assessmentScheduleSlotTimingId:number,
    center:string,
    language:string,
    candidatePhoto:any,
    candidateSignature:any,
    customFields:Array<customFieldArray>;
    tenantId:number,
    scheduleIdNumber:string
}
export interface customFieldArray {
  fieldLabel: string;
  fieldValue: string;
}
export interface SlotBookResultDto {
  isSuccess: boolean;
  errorMessage: string;
}
export interface AssessmentDetails {
  availableCentres:[];
  supportedLanguages:[];
  availableSlots:[];
  assessmentScheduleCustomFields: Array<RegisterSlotCustomField>;
  assessmentScheduleId: number;
}
export interface RegisterSlotCustomField {
  fieldLabel: string,
  scheduleId?: number,
  fieldType: CustomFieldType,
  defaultValue?: string,
  isMandatory: boolean
}
export enum CustomFieldType {
  TextBox = 1,
  DropDown = 2
}
export interface RegisterSlotCustomFieldUserInput {
  fieldLabel: string,
  fieldValue: string
}

export class RegisterSlotCustomFieldCollectionDto {
  customField: RegisterSlotCustomFieldUserInput[]
}
export interface NgbDate {
  year: number;
  month: number;
  day: number;
}