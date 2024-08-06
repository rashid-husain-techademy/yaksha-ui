import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewCrosswordPuzzleComponent } from './review-crossword-puzzle.component';

describe('ReviewCrosswordPuzzleComponent', () => {
  let component: ReviewCrosswordPuzzleComponent;
  let fixture: ComponentFixture<ReviewCrosswordPuzzleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewCrosswordPuzzleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewCrosswordPuzzleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
