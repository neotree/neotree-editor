const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const ts = require("typescript")

function loadTsModule(relativePath) {
  const filename = path.resolve(__dirname, relativePath)
  const source = fs.readFileSync(filename, "utf8")
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  })

  const sandboxModule = { exports: {} }
  const script = new vm.Script(transpiled.outputText, { filename })
  const dirname = path.dirname(filename)

  function localRequire(id) {
    if (id.startsWith("./") || id.startsWith("../")) {
      return loadTsModule(path.join(path.dirname(relativePath), id))
    }
    return require(require.resolve(id, { paths: [dirname] }))
  }

  script.runInNewContext({
    module: sandboxModule,
    exports: sandboxModule.exports,
    require: localRequire,
    __dirname: dirname,
    __filename: filename,
    console,
    process,
  })

  return sandboxModule.exports
}

const { CHANGELOG_DELETE_ACTIONS } = loadTsModule("../lib/changelog-action-labels.ts")

const expectedMetadata = {
  script: {
    historyAction: "delete_script",
    description: "Delete script",
  },
  screen: {
    historyAction: "delete_screen",
    description: "Delete screen",
  },
  diagnosis: {
    historyAction: "delete_diagnosis",
    description: "Delete diagnosis",
  },
  config_key: {
    historyAction: "delete_config_key",
    description: "Delete config key",
  },
  drugs_library: {
    historyAction: "delete_drugs_library_item",
    description: "Delete drugs library item",
  },
  data_key: {
    historyAction: "delete_data_key",
    description: "Delete data key",
  },
}

for (const [entity, expectation] of Object.entries(expectedMetadata)) {
  const metadata = CHANGELOG_DELETE_ACTIONS[entity]
  assert.ok(metadata, `Missing delete metadata for ${entity}`)
  assert.equal(metadata.historyAction, expectation.historyAction, `Unexpected delete action for ${entity}`)
  assert.equal(metadata.description, expectation.description, `Unexpected delete description for ${entity}`)
}

console.log("Changelog delete action metadata verified for all entities.")
