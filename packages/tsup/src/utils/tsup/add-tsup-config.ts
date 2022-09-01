import { Tree } from '@nrwl/devkit';
import { join } from 'path';

const tsupConfigString = `import { defineConfig } from 'tsup';

export default defineConfig({
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ['cjs', 'esm'],
});
`;

export function addTsupConfig(tree: Tree, projectDir: string): void {
  const tsupConfigPath = join(projectDir, 'tsup.config.ts');

  if (tree.exists(tsupConfigPath)) {
    return;
  }

  tree.write(tsupConfigPath, tsupConfigString);
}
