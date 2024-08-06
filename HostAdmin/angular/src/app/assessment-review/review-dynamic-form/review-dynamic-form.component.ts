import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Questions } from '../assessment-review';

@Component({
  selector: 'app-review-dynamic-form',
  templateUrl: './review-dynamic-form.component.html'
})
export class ReviewDynamicFormComponent implements OnChanges {

  @Input() fields: Questions;
  form: FormGroup;
  @Output() questionRemove = new EventEmitter<any>();

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

  onQuestionRemove(event) {
    this.questionRemove.emit(event);
  }

}
