const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('@react-native/metro-config');

const expoConfig = getDefaultConfig(__dirname);
const config = {};

module.exports = mergeConfig(expoConfig, config);
