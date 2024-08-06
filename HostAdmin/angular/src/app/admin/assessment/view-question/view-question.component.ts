import { Component, Input, OnInit } from '@angular/core';
import { Constants } from '@app/models/constants';
import { Helper } from '@app/shared/helper';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-view-question',
  templateUrl: './view-question.component.html',
  styleUrls: ['./view-question.component.scss']
})
export class ViewQuestionComponent implements OnInit {
  @Input() public questionText: string;
  @Input() public choices: string[] = [];
  @Input() public isMcq: boolean = false;
  @Input() public skill:string;
  @Input() public category:string;
  constants = Constants;
  helper = Helper;

  constructor(private activeModal: NgbActiveModal
  ) { }

  ngOnInit(): void {
    if (this.isMcq)
      this.disbleCopyPaste('view-questionform');
    if (this.questionText.includes('<img')) {
      this.questionText = this.addHeightWidthToImage(this.questionText);
    }
  }

  addHeightWidthToImage(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const imgElements = doc.querySelectorAll('img');
    imgElements.forEach((imgElement) => {
        imgElement.setAttribute('height', '100%');
        imgElement.setAttribute('width', '100%');
    });
    return doc.body.innerHTML;
  }

  disbleCopyPaste(elementref) {
    let events = 'cut,copy,paste';
    events.split(',').forEach(e =>
      document.getElementById(elementref).addEventListener(e, (event) => {
        event.preventDefault();
      })
    );
  }

  close() {
    this.activeModal.close();
  }

}
