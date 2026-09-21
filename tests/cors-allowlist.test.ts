import assert from "assert"

import {
  CORS_ALLOWED_HEADERS,
  CORS_ALLOWED_METHODS,
  getCorsResponseHeaders,
  isApiPath,
  parseAllowedOrigins,
  resolveAllowedOrigin,
} from "../lib/cors"

const APP_URL = "https://webeditor.neotree.org"
const PARTNER = "https://zim-webeditor.neotree.org"

const allowed = parseAllowedOrigins(`${PARTNER}, https://demo-webeditor.neotree.org`, APP_URL)

assert.ok(allowed.has(APP_URL), "the app's own origin should always be allowed")
assert.ok(allowed.has(PARTNER), "configured origins should be allowed")
assert.equal(allowed.size, 3, "allowlist should hold exactly the configured origins plus the app url")

// The wildcard this ticket removed must never come back through configuration.
assert.equal(
  resolveAllowedOrigin("https://evil.example.com", allowed),
  null,
  "an origin outside the allowlist must not be echoed back",
)
assert.equal(
  resolveAllowedOrigin("*", allowed),
  null,
  "a literal wildcard origin must not be treated as allowed",
)
assert.equal(
  resolveAllowedOrigin(PARTNER, allowed),
  PARTNER,
  "an allowlisted origin should be echoed back verbatim",
)

// No Origin header means it is not a browser cross-origin call. Native device
// clients and server-to-server callers must pass through untouched.
assert.equal(resolveAllowedOrigin(null, allowed), null, "a missing Origin must not produce CORS headers")
assert.equal(resolveAllowedOrigin("", allowed), null, "an empty Origin must not produce CORS headers")

// Trailing slashes and casing are presentation differences, not different origins.
const loose = parseAllowedOrigins("https://Example.org/", null)
assert.equal(
  resolveAllowedOrigin("https://example.org", loose),
  "https://example.org",
  "origin matching should ignore trailing slash and case",
)

// A deployment that names no origins should permit no cross-origin browser callers.
const empty = parseAllowedOrigins("", "")
assert.equal(empty.size, 0, "unset configuration should produce an empty allowlist")
assert.equal(
  resolveAllowedOrigin(APP_URL, empty),
  null,
  "with nothing configured, no origin should be allowed",
)

const headers = getCorsResponseHeaders(PARTNER)
assert.equal(headers["Access-Control-Allow-Origin"], PARTNER, "allow-origin should be the resolved origin")
assert.notEqual(headers["Access-Control-Allow-Origin"], "*", "allow-origin must never be a wildcard")
assert.equal(headers["Access-Control-Allow-Methods"], CORS_ALLOWED_METHODS)
assert.equal(headers["Access-Control-Allow-Headers"], CORS_ALLOWED_HEADERS)
assert.equal(headers["Vary"], "Origin", "responses must vary on Origin so caches cannot cross origins")

assert.ok(isApiPath("/api"), "/api is an api path")
assert.ok(isApiPath("/api/scripts"), "/api/* is an api path")
assert.ok(!isApiPath("/apidocs"), "a path merely prefixed with /api is not an api path")
assert.ok(!isApiPath("/login"), "non-api paths should not get CORS handling")

console.log("cors-allowlist: all assertions passed")
