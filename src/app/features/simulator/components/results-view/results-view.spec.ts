import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsViewComponent } from './results-view';

describe('ResultsViewComponent', () => {
  let component: ResultsViewComponent;
  let fixture: ComponentFixture<ResultsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultsViewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
