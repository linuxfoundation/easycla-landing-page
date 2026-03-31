// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

const INTERCOM_API_BASE = 'https://api-iam.intercom.io';

export interface IntercomBootOptions {
  api_base?: string;
  app_id?: string;
  user_id?: string;
  name?: string;
  email?: string;
  created_at?: number;
  intercom_user_jwt?: string;
  [key: string]: any;
}

declare global {
  interface Window {
    Intercom?: any;
    intercomSettings?: any;
  }
}

@Injectable({ providedIn: 'root' })
export class IntercomService {
  private isLoaded = false;
  private isBooted = false;
  private isLoading = false;
  private bootedWithIdentity = false;
  private bootRequestId = 0;

  /**
   * Boot Intercom. Can be called with no user data (anonymous — for banners/popups)
   * or with user data (identified — for authenticated sessions).
   * Returns a Promise so the caller can handle failures.
   */
  public boot(options: IntercomBootOptions): Promise<void> {
    const requestId = ++this.bootRequestId;
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window is undefined'));
        return;
      }

      if (!environment.intercomId) {
        reject(new Error('No Intercom ID configured'));
        return;
      }

      if (this.isBooted) {
        if (options.user_id && !this.bootedWithIdentity) {
          // Upgrade from anonymous to identified: shutdown and re-boot with identity
          this.shutdownForReboot();
        } else {
          // Already booted in the same mode — update instead
          const { intercom_user_jwt: _jwt, app_id: _appId, api_base: _apiBase, ...userOptions } = options;
          this.update(userOptions);
          resolve();
          return;
        }
      }

      // Kick off script loading (deferred to first boot call)
      if (!this.isLoaded && !this.isLoading) {
        this.isLoading = true;
        this.loadIntercomScript();
      }

      // Set JWT in intercomSettings before boot — required for identity verification
      if (options.intercom_user_jwt) {
        window.intercomSettings = window.intercomSettings || {};
        window.intercomSettings.intercom_user_jwt = options.intercom_user_jwt;
      }

      // Poll until script is fully loaded (isLoaded flag, not just window.Intercom — the
      // stub is created immediately but the real script must load for identity verification)
      const checkLoaded = setInterval(() => {
        if (requestId !== this.bootRequestId) {
          clearInterval(checkLoaded);
          clearTimeout(timeoutHandle);
          resolve();
          return;
        }
        if (this.isLoaded && window.Intercom) {
          clearInterval(checkLoaded);
          clearTimeout(timeoutHandle);

          // Another concurrent boot() call may have already booted
          if (this.isBooted) {
            if (options.user_id && !this.bootedWithIdentity) {
              // Concurrent anonymous boot finished first — upgrade to identified
              this.shutdownForReboot();
              // Fall through to boot with identity below
            } else {
              const { intercom_user_jwt: _jwt, app_id: _appId, api_base: _apiBase, ...userOptions } = options;
              this.update(userOptions);
              resolve();
              return;
            }
          }

          // Set flag before calling boot() to prevent concurrent calls from racing
          this.isBooted = true;

          try {
            // Strip JWT, app_id, and api_base from caller options — environment values always win
            const { intercom_user_jwt: _jwt, app_id: _appId, api_base: _apiBase, ...bootOptions } = options;

            window.Intercom('boot', {
              api_base: INTERCOM_API_BASE,
              app_id: environment.intercomId,
              ...bootOptions,
            });
            this.bootedWithIdentity = !!bootOptions.user_id;

            // Force update to ensure user attributes are applied (only for identified users)
            if (bootOptions.user_id) {
              try {
                window.Intercom('update', {
                  user_id: bootOptions.user_id,
                  name: bootOptions.name,
                  email: bootOptions.email,
                });
              } catch (updateError) {
                console.warn('IntercomService: Update after boot failed', updateError);
                // Don't reset isBooted — Intercom is still booted
              }
            }

            resolve();
          } catch (error) {
            this.isBooted = false;
            console.error('IntercomService: Boot failed', error);
            reject(error);
          }
        }
      }, 100);

      const timeoutHandle = setTimeout(() => {
        clearInterval(checkLoaded);
        if (requestId !== this.bootRequestId) {
          return;
        }
        if (!this.isBooted) {
          this.isLoading = false;
          reject(new Error('Intercom script failed to load — check network, CSP, or ad blockers'));
        }
      }, 10000);
    });
  }

  private update(data?: Partial<IntercomBootOptions>): void {
    if (typeof window !== 'undefined' && window.Intercom && this.isBooted) {
      try {
        window.Intercom('update', data || {});
      } catch (error) {
        console.error('IntercomService: Update failed', error);
      }
    }
  }

  public shutdown(): void {
    this.bootRequestId++;
    if (typeof window !== 'undefined') {
      // Clear JWT first — prevents credential leakage across sessions
      if (window.intercomSettings?.intercom_user_jwt) {
        delete window.intercomSettings.intercom_user_jwt;
      }

      if (window.Intercom && this.isBooted) {
        try {
          window.Intercom('shutdown');
        } catch (error) {
          console.error('IntercomService: Shutdown failed', error);
        }
        this.isBooted = false;
        this.bootedWithIdentity = false;
      }
    }
  }

  /**
   * Internal shutdown for re-booting (anonymous → identified transition).
   * Resets boot state but keeps the script loaded.
   */
  private shutdownForReboot(): void {
    if (typeof window !== 'undefined' && window.Intercom) {
      try {
        window.Intercom('shutdown');
      } catch (error) {
        console.warn('IntercomService: Shutdown for reboot failed', error);
      }
    }
    this.isBooted = false;
    this.bootedWithIdentity = false;
  }

  public isIntercomBooted(): boolean {
    return this.isBooted;
  }

  private loadIntercomScript(): void {
    if (this.isLoaded || typeof window === 'undefined') {
      return;
    }

    // Create Intercom stub so queued calls work before script loads
    this.initializeIntercomFunction();

    // Pre-set app settings (JWT added separately in boot())
    window.intercomSettings = {
      api_base: INTERCOM_API_BASE,
      app_id: environment.intercomId,
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `https://widget.intercom.io/widget/${environment.intercomId}`;

    script.onload = () => {
      this.isLoaded = true;
      this.isLoading = false;
    };

    script.onerror = error => {
      this.isLoading = false;
      console.error('IntercomService: Failed to load script', error);
    };

    // Insert before first existing script for optimal load ordering
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      (document.head || document.body).appendChild(script);
    }
  }

  private initializeIntercomFunction(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const w = window as any;
    const ic = w.Intercom;

    if (typeof ic === 'function') {
      // Script already loaded (e.g. page reload) — reattach
      ic('reattach_activator');
      ic('update', w.intercomSettings);
    } else {
      // Create stub that queues commands until the real script loads
      const i: any = (...args: any[]) => { i.c(args); };
      i.q = [];
      i.c = (args: any) => { i.q.push(args); };
      w.Intercom = i;
    }
  }
}
