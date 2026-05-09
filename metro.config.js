// Metro config — required for react-native-get-random-values
// to properly polyfill crypto.getRandomValues in Expo Go
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
