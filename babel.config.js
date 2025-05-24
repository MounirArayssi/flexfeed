module.exports = function(api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        // Add any other plugins here (if needed)
        'react-native-reanimated/plugin', // 👈 MUST BE LAST
      ],
    };
  };
  