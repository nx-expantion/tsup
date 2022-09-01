import { addDependenciesToPackageJson, Tree } from '@nrwl/devkit';
import { swcCoreVersion } from '../versions';

export function addSwcDependencies(tree: Tree) {
  return addDependenciesToPackageJson(
    tree,
    {},
    {
      '@swc/core': swcCoreVersion,
    }
  );
}
