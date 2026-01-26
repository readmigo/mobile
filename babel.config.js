module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/features': './src/features',
            '@/hooks': './src/hooks',
            '@/stores': './src/stores',
            '@/services': './src/services',
            '@/utils': './src/utils',
            '@/theme': './src/theme',
            '@/i18n': './src/i18n',
            '@/types': './src/types',
            '@/assets': './assets',
          },
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
