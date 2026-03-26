
// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LfxHeaderService {

  constructor(private auth: AuthService) {
  }

  setCallBackUrl() {
    const lfHeaderEl: any = document.getElementById('lfx-header');
    if (!lfHeaderEl) {
      return;
    }
    lfHeaderEl.callbackurl = window.location.origin;
  }

  handleLogout() {
    const lfHeaderEl: any = document.getElementById('lfx-header');
    if (!lfHeaderEl) {
      return;
    }
    lfHeaderEl.logouturl = window.location.origin;
    lfHeaderEl.userefreshtoken = 'true';
    lfHeaderEl.beforeLogout = () => {
      this.auth.logout();
    };
  }

  setUserInLFxHeader(): void {
    const lfHeaderEl: any = document.getElementById('lfx-header');
    if (!lfHeaderEl) {
      return;
    }

    this.auth.userProfile$.subscribe((data) => {
      if (data) {
        lfHeaderEl.authuser = data;
      }
    });
  }
}
