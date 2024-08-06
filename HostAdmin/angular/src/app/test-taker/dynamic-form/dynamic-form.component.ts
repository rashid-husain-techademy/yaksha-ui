import { Component, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { QuestionDetailDto } from '../field';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnChanges {
  @Input() fields: QuestionDetailDto;
  // @Output() submit: EventEmitter<any> = new EventEmitter<any>();
  form: FormGroup;

  get value() {
    return this.form.value;
  }

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnChanges() {
    this.form = this.addFormControl();
  }

  addFormControl() {
    let formGroup = this.formBuilder.group({});
    const control = this.formBuilder.control(this.fields.questionId);
    let formControlName = `question${this.fields.questionId}`;
    formGroup.addControl(formControlName, control);
    return formGroup;
  }
}