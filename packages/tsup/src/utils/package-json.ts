export interface PackageJson {
  name?: string;
  dependencies?: Record<string, string | undefined>;
  devDependencies?: Record<string, string | undefined>;
  main?: string;
  typings?: string;
  module?: string;
}
