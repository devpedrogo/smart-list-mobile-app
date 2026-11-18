module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.ANDROID_GOOGLE_MAPS_API_KEY?.trim();

  if (process.env.EAS_BUILD === 'true' && !googleMapsApiKey) {
    throw new Error(
      'ANDROID_GOOGLE_MAPS_API_KEY must be configured in the EAS build environment.',
    );
  }

  const plugins = (config.plugins ?? []).filter((plugin) => {
    const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;
    return pluginName !== 'react-native-maps';
  });
  plugins.push([
    'react-native-maps',
    { androidGoogleMapsApiKey: googleMapsApiKey },
  ]);

  return { ...config, plugins };
};
