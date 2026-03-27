// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './core/services/auth.service';
import { IntercomService } from './core/services/intercom.service';
import { LfxHeaderService } from './core/services/lfx-header.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  hasExpanded: boolean;
  private intercomBootAttempted = false;

  constructor(
    private lfxHeaderService: LfxHeaderService,
    private auth: AuthService,
    private intercomService: IntercomService,
  ) {
    this.hasExpanded = true;
    this.mountHeader();
  }

  ngOnInit() {
    // Boot Intercom in anonymous mode so banners/popups show for all visitors
    this.bootIntercomAnonymous();

    // Subscribe to auth state for identified boot / shutdown
    this.auth.userProfile$.subscribe(userProfile => {
      if (userProfile) {
        if (!this.intercomBootAttempted && environment.intercomId) {
          const intercomJwt = userProfile[environment.auth0IntercomClaim];
          const userId = userProfile[environment.auth0UsernameClaim];

          if (userId && intercomJwt) {
            this.intercomBootAttempted = true;
            this.intercomService
              .boot({
                api_base: environment.intercomApiBase,
                app_id: environment.intercomId,
                intercom_user_jwt: intercomJwt,
                user_id: userId,
                name: userProfile.name,
                email: userProfile.email,
              })
              .catch((error: any) => {
                console.error('AppComponent: Failed to boot Intercom', error);
                this.intercomBootAttempted = false;
              });
          } else {
            console.warn('AppComponent: Intercom not booted — missing required claim(s)', {
              hasUserId: !!userId,
              hasIntercomJwt: !!intercomJwt,
            });
          }
        }
      } else if (userProfile == null) {
        // Logout or unauthenticated — shutdown identified session
        if (this.intercomBootAttempted) {
          this.intercomService.shutdown();
          this.intercomBootAttempted = false;
        }
        // Re-boot anonymous so banners remain visible
        this.bootIntercomAnonymous();
      }
    });
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

  private bootIntercomAnonymous() {
    if (environment.intercomId) {
      this.intercomService
        .boot({
          app_id: environment.intercomId,
          api_base: environment.intercomApiBase,
        })
        .catch((error: any) => {
          console.warn('AppComponent: Anonymous Intercom boot failed', error);
        });
    }
  }
}
