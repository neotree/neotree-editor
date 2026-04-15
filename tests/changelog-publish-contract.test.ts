import assert from "node:assert/strict"

import { _publishConfigKeys } from "../databases/mutations/config-keys/_config-keys-publish"
import { _publishHospitals } from "../databases/mutations/hospitals/_publish"
import { _publishScripts } from "../databases/mutations/scripts/_scripts_publish"

async function main() {
  const missingReleaseContextCases = await Promise.all([
    _publishConfigKeys(),
    _publishConfigKeys({ dataVersion: 2 }),
    _publishConfigKeys({ client: {} as any }),
    _publishHospitals(),
    _publishHospitals({ dataVersion: 2 }),
    _publishHospitals({ client: {} as any }),
    _publishScripts({}),
    _publishScripts({ dataVersion: 2 }),
    _publishScripts({ client: {} as any }),
  ])

  assert.deepEqual(
    missingReleaseContextCases.map((result) => result.success),
    [false, false, false, false, false, false, false, false, false],
    "publishers must fail fast whenever they are invoked outside the coordinated release transaction",
  )

  const allErrors = missingReleaseContextCases.flatMap((result) => result.errors ?? [])
  assert.equal(
    allErrors.every((error) => error.includes("must run inside a release transaction")),
    true,
    "release-only publishers should return an explicit contract error when client or dataVersion is missing",
  )

  console.log("changelog publish contract tests passed")
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
