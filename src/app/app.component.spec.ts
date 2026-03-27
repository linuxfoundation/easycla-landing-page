// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { LfxHeaderService } from './core/services/lfx-header.service';
import { AuthService } from './core/services/auth.service';
import { StorageService } from './core/services/storage.service';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        { provide: LfxHeaderService, useValue: { setUserInLFxHeader: () => {}, setCallBackUrl: () => {}, handleLogout: () => {} } },
        { provide: AuthService, useValue: {} },
        { provide: StorageService, useValue: {} },
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
