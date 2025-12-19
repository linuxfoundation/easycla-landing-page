// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  hasExpanded: boolean;

  banner = {
    text: 'Meet us in Amsterdam for KubeCon + CloudNativeCon Europe 2026 • Mar 23–26 •',
    ctaText: 'Register now',
    url: 'https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/register/?utm_source=cla-landing-page&utm_medium=homepage&utm_campaign=18269725-KubeCon-EU-2026&utm_content=hero'
  };

  constructor() {
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



