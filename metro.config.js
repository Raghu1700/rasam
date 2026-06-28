// Metro config tweaked for the Firebase JS SDK (v9+/v11).
//
// Without these two lines Metro's package-exports handling resolves Firebase's
// internals incorrectly, producing the classic runtime error:
//   "Component auth has not been registered yet"
// See: https://github.com/firebase/firebase-js-sdk/issues/7584
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
