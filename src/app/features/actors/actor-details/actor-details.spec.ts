import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActorDetails } from './actor-details';

describe('ActorDetails', () => {
  let component: ActorDetails;
  let fixture: ComponentFixture<ActorDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActorDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(ActorDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
