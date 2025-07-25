import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldConfig } from './field-config';

describe('FieldConfig', () => {
  let component: FieldConfig;
  let fixture: ComponentFixture<FieldConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
