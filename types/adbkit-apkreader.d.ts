declare module "@devicefarmer/adbkit-apkreader" {
  export interface ApkManifest {
    package?: string
    versionCode?: number
    versionName?: string
    compileSdkVersion?: number
    usesSdk?: {
      minSdkVersion?: number
      targetSdkVersion?: number
    }
    application?: {
      label?: unknown
      debuggable?: boolean
    }
    [key: string]: unknown
  }

  export default class ApkReader {
    static open(path: string): Promise<ApkReader>
    readManifest(): Promise<ApkManifest>
    readContent(path: string): Promise<Buffer>
  }
}
