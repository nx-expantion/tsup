export interface PackageJson {
  dependencies?: Record<string, string | undefined>;
  devDependencies?: Record<string, string | undefined>;
}
