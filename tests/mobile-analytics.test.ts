import assert from 'node:assert/strict';

import {
    extractMobileAnalyticsKey,
    generateMobileAnalyticsKey,
    hashMobileAnalyticsKey,
    isMobileAnalyticsRateLimited,
    validateInactivityTimeout,
    validateSupersetUrl,
} from '../lib/mobile-analytics';

// URL validation
assert.equal(validateSupersetUrl('https://superset.example.org/').url, 'https://superset.example.org');
assert.equal(validateSupersetUrl(' https://a.org/sub/ ').url, 'https://a.org/sub');
assert.ok(validateSupersetUrl('http://a.org').error);
assert.ok(validateSupersetUrl('ftp://a.org').error);
assert.ok(validateSupersetUrl('https://user:pw@a.org').error);
assert.ok(validateSupersetUrl('https://a.org/?x=1').error);
assert.ok(validateSupersetUrl('').error);
assert.ok(validateSupersetUrl('not a url').error);

// Timeout validation
assert.equal(validateInactivityTimeout('15').minutes, 15);
assert.equal(validateInactivityTimeout(1440).minutes, 1440);
assert.ok(validateInactivityTimeout(0).error);
assert.ok(validateInactivityTimeout(1441).error);
assert.ok(validateInactivityTimeout(1.5).error);
assert.ok(validateInactivityTimeout('').error);
assert.ok(validateInactivityTimeout('abc').error);

// Keys: unique, hashed deterministically, distinct hashes
const a = generateMobileAnalyticsKey();
const b = generateMobileAnalyticsKey();
assert.notEqual(a, b);
assert.ok(a.startsWith('nta_'));
assert.equal(hashMobileAnalyticsKey(a), hashMobileAnalyticsKey(a));
assert.notEqual(hashMobileAnalyticsKey(a), hashMobileAnalyticsKey(b));
assert.ok(!hashMobileAnalyticsKey(a).includes(a));

// Header extraction
assert.equal(extractMobileAnalyticsKey(new Headers({ 'x-api-key': ' k1 ' })), 'k1');
assert.equal(extractMobileAnalyticsKey(new Headers({ authorization: 'Bearer k2' })), 'k2');
assert.equal(extractMobileAnalyticsKey(new Headers({ authorization: 'Basic abc' })), null);
assert.equal(extractMobileAnalyticsKey(new Headers()), null);

// Rate limiting
const t = Date.now();
for (let i = 0; i < 120; i++) assert.equal(isMobileAnalyticsRateLimited('x', t), false);
assert.equal(isMobileAnalyticsRateLimited('x', t), true);
assert.equal(isMobileAnalyticsRateLimited('x', t + 61_000), false);

console.log('mobile-analytics tests passed');
