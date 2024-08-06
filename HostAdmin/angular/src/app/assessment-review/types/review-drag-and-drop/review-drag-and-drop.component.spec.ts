import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewDragAndDropComponent } from './review-drag-and-drop.component';

describe('ReviewDragAndDropComponent', () => {
  let component: ReviewDragAndDropComponent;
  let fixture: ComponentFixture<ReviewDragAndDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewDragAndDropComponent]
    })
      .compileComponents();
  });
  
  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewDragAndDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
