/**
 * JEST SETUP — after the environment is up.
 *
 * `react-native-worklets` is a native library and its module initialiser reads
 * a native handle at IMPORT time, so merely importing `react-native-reanimated`
 * throws `Cannot read properties of undefined (reading 'loadUnpackers')` under
 * Jest. The library ships a complete mock for exactly this; per its testing
 * guide, enforcing the mock is the recommended route.
 *
 * ORDER MATTERS: the worklets mock must be registered before Reanimated is
 * required, because Reanimated pulls worklets in from its own initialisers.
 */
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'))

require('react-native-reanimated').setUpTests()
