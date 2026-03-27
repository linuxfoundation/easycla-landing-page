// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IntercomService } from './intercom.service';

describe('IntercomService', () => {
  let service: IntercomService;
  let originalIntercom: any;
  let originalIntercomSettings: any;

  beforeEach(() => {
    originalIntercom = (window as any).Intercom;
    originalIntercomSettings = (window as any).intercomSettings;
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntercomService);

    // Reset window state between tests
    delete (window as any).Intercom;
    delete (window as any).intercomSettings;
  });

  afterEach(() => {
    if (originalIntercom === undefined) {
      delete (window as any).Intercom;
    } else {
      (window as any).Intercom = originalIntercom;
    }
    if (originalIntercomSettings === undefined) {
      delete (window as any).intercomSettings;
    } else {
      (window as any).intercomSettings = originalIntercomSettings;
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('boot()', () => {
    it('boots anonymously and sets isBooted', fakeAsync(() => {
      const intercomCalls: any[] = [];

      let resolved = false;
      service.boot({ app_id: 'test-id' })
        .then(() => { resolved = true; });

      // Simulate script load: replace the stub with a real mock
      (window as any).Intercom = (...args: any[]) => intercomCalls.push(args);
      (service as any).isLoaded = true;
      tick(200);

      expect(resolved).toBeTrue();
      expect(service.isIntercomBooted()).toBeTrue();
      expect(intercomCalls[0][0]).toBe('boot');
    }));

    it('sets intercom_user_jwt in intercomSettings before boot, not in boot payload', fakeAsync(() => {
      const bootArgs: any[] = [];

      service.boot({
        app_id: 'test-id',
        user_id: 'user123',
        intercom_user_jwt: 'test-jwt',
      });

      // Simulate script load
      (window as any).Intercom = (cmd: string, opts?: any) => {
        if (cmd === 'boot') bootArgs.push(opts);
      };
      (service as any).isLoaded = true;
      tick(200);

      expect((window as any).intercomSettings.intercom_user_jwt).toBe('test-jwt');
      expect(bootArgs[0].intercom_user_jwt).toBeUndefined();
    }));

    it('rejects after timeout if script fails to load', fakeAsync(() => {
      let rejected = false;
      service.boot({ app_id: 'test-id' }).catch(() => { rejected = true; });

      tick(10001);

      expect(rejected).toBeTrue();
      expect(service.isIntercomBooted()).toBeFalse();
    }));

    it('does not boot if shutdown() is called before script loads', fakeAsync(() => {
      const intercomCalls: any[] = [];

      service.boot({ app_id: 'test-id', user_id: 'user123' });
      service.shutdown(); // cancels the in-flight boot

      (window as any).Intercom = (...args: any[]) => intercomCalls.push(args);
      (service as any).isLoaded = true;
      tick(200);

      expect(intercomCalls.some(([cmd]) => cmd === 'boot')).toBeFalse();
      expect(service.isIntercomBooted()).toBeFalse();
    }));
  });

  describe('shutdown()', () => {
    it('clears intercom_user_jwt from intercomSettings', fakeAsync(() => {
      (window as any).Intercom = () => {};
      (window as any).intercomSettings = { intercom_user_jwt: 'test-jwt' };
      (service as any).isBooted = true;

      service.shutdown();

      expect((window as any).intercomSettings.intercom_user_jwt).toBeUndefined();
      expect(service.isIntercomBooted()).toBeFalse();
    }));
  });
});
