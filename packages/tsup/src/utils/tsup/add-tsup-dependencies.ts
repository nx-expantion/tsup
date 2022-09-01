import { addDependenciesToPackageJson, Tree } from '@nrwl/devkit';
import { tsupVersion } from '../versions';

export function addTsupDependencies(tree: Tree) {
  return addDependenciesToPackageJson(
    tree,
    {},
    {
      tsup: tsupVersion,
    }
  );
}
