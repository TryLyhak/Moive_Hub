import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Actors } from './actors';

describe('Actors', () => {
  let component: Actors;
  let fixture: ComponentFixture<Actors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Actors],
    }).compileComponents();

    fixture = TestBed.createComponent(Actors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
