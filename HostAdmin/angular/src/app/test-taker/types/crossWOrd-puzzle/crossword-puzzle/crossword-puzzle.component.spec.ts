import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrosswordPuzzleComponent } from './crossword-puzzle.component';

describe('CrosswordPuzzleComponent', () => {
  let component: CrosswordPuzzleComponent;
  let fixture: ComponentFixture<CrosswordPuzzleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrosswordPuzzleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrosswordPuzzleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
