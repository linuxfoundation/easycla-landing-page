// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { EnvConfig } from './config/cla-env-utils';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  hasExpanded: boolean;

  constructor(  ) {
    this.hasExpanded = true;
    this.mountHeader();
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



