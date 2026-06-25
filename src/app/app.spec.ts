import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { SwUpdate } from '@angular/service-worker';
import { of } from 'rxjs';

describe('App', () => {
  let mockSwUpdate: any;

  beforeEach(async () => {
    mockSwUpdate = {
      isEnabled: false,
      versionUpdates: of(),
      activateUpdate: () => Promise.resolve(true)
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: SwUpdate, useValue: mockSwUpdate }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
