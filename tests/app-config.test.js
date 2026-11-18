import { afterEach, describe, expect, it, vi } from 'vitest';
const appConfig = require('../app.config');

describe('Android Google Maps configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('passes the configured API key to the react-native-maps plugin', () => {
    vi.stubEnv('ANDROID_GOOGLE_MAPS_API_KEY', 'test-android-maps-key');
    vi.stubEnv('EAS_BUILD', 'true');

    const result = appConfig({ config: { plugins: ['expo-router'] } });

    expect(result.plugins).toContainEqual([
      'react-native-maps',
      { androidGoogleMapsApiKey: 'test-android-maps-key' },
    ]);
  });

  it('fails EAS builds when the API key is missing', () => {
    vi.stubEnv('ANDROID_GOOGLE_MAPS_API_KEY', '');
    vi.stubEnv('EAS_BUILD', 'true');

    expect(() => appConfig({ config: { plugins: [] } })).toThrow(
      'ANDROID_GOOGLE_MAPS_API_KEY must be configured',
    );
  });
});
