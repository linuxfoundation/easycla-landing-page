
// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { Injectable } from '@angular/core';
import { filter, take } from 'rxjs/operators';
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
    lfHeaderEl.beforeLogout = () => {
      this.auth.logout();
    };
  }

  setUserInLFxHeader(): void {
    const lfHeaderEl: any = document.getElementById('lfx-header');
    if (!lfHeaderEl) {
      return;
    }

    this.auth.userProfile$.pipe(
      filter(data => !!data),
      take(1)
    ).subscribe((data) => {
      lfHeaderEl.authuser = data;
    });
  }
}
