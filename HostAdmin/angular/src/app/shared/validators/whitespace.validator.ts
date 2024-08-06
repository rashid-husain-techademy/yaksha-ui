import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs';

export class WhiteSpaceValidators {

  static emptySpace(): ValidatorFn {
    return (c: AbstractControl): { [key: string]: boolean } | null => {
      if (c.value !== undefined && (c.value || '').trim().length === 0) {
        return { 'whitespace': true };
      }
      return null;
    };
  }

  static compareValidator(controlNameToCompare: string): ValidatorFn {
    return (c: AbstractControl): ValidationErrors | null => {
      if (c.value === null || c.value.length === 0) {
        return null;
      }
      const controlToCompare = c.root.get(controlNameToCompare);
      if (controlToCompare) {
        const subscription: Subscription = controlToCompare.valueChanges.subscribe(() => {
          c.updateValueAndValidity();
          subscription.unsubscribe();
        });
      }
      return controlToCompare && controlToCompare.value !== c.value ? { 'compare': true } : null;
    };
  }
}
