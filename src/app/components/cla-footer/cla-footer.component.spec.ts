// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClaFooterComponent } from './cla-footer.component';

describe('ClaFooterComponent', () => {
  let component: ClaFooterComponent;
  let fixture: ComponentFixture<ClaFooterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
