// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { AfterViewInit, Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LfxHeaderService } from './core/services/lfx-header.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  hasExpanded: boolean;

  constructor(private lfxHeaderService: LfxHeaderService) {
    this.hasExpanded = true;
    this.mountHeader();
  }

  ngAfterViewInit() {
    this.lfxHeaderService.setUserInLFxHeader();
    this.lfxHeaderService.setCallBackUrl();
    this.lfxHeaderService.handleLogout();
  }

  onToggled() {
    this.hasExpanded = !this.hasExpanded;
  }

  mountHeader() {
    const script = document.createElement('script');
    script.setAttribute('src', environment.lfxHeader);
    document.head.appendChild(script);
  }
}
