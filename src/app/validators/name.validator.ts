import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function invalidNameValidator(nameRe: RegExp): ValidatorFn
{
  return (control: AbstractControl): ValidationErrors | null => {
    const invalid = !nameRe.test(control.value);
    return invalid ? {invalidName: {value: control.value}} : null;
  };
}