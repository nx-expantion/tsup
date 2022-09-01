import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import {
  Tree,
  readProjectConfiguration,
  addProjectConfiguration,
  readJson,
} from '@nrwl/devkit';

import generator from './generator';
import { ConvertToTsupGeneratorSchema } from './schema';
import { join } from 'path';
import { swcCoreVersion, tsupVersion } from '../../utils/versions';

const projectName = 'lib';
const projectRoot = 'packages/lib';

describe('convert-to-tsup generator', () => {
  let tree: Tree;
  const options: ConvertToTsupGeneratorSchema = {
    project: projectName,
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    tree.write('packages/lib/package.json', '{}');
  });

  it('should run successfully', async () => {
    addProjectConfiguration(tree, projectName, {
      root: projectRoot,
      projectType: 'library',
      targets: {
        build: {
          executor: '@nrwl/js:tsc',
          options: {
            main: 'packages/lib/src/index.ts',
          },
        },
      },
    });

    await generator(tree, options);

    const projectConfiguration = readProjectConfiguration(tree, projectName);

    expect(tree.exists(join(projectConfiguration.root, 'tsup.config.ts'))).toBe(
      true
    );

    expect(projectConfiguration.targets).toEqual({
      build: {
        executor: '@nx-expansion/tsup:build',
        options: {
          entry: ['packages/lib/src/index.ts'],
          tsupConfig: 'packages/lib/tsup.config.ts',
        },
      },
    });

    expect(readJson(tree, 'package.json')).toMatchObject({
      dependencies: {},
      devDependencies: {
        '@swc/core': swcCoreVersion,
        tsup: tsupVersion,
      },
    });
  });

  it('should run with --targets successfully', async () => {
    addProjectConfiguration(tree, projectName, {
      root: projectRoot,
      projectType: 'library',
      targets: {
        'build-1': {
          executor: '@nrwl/js:tsc',
          options: {
            main: 'packages/lib/src/index.ts',
          },
        },
        'build-2': {
          executor: '@nrwl/js:tsc',
          options: {
            main: 'packages/lib/src/index.ts',
          },
        },
      },
    });

    await generator(tree, {
      ...options,
      targets: ['build-1', 'build-2'],
    });

    const projectConfiguration = readProjectConfiguration(tree, projectName);

    expect(tree.exists(join(projectConfiguration.root, 'tsup.config.ts'))).toBe(
      true
    );

    expect(projectConfiguration.targets).toEqual({
      'build-1': {
        executor: '@nx-expansion/tsup:build',
        options: {
          entry: ['packages/lib/src/index.ts'],
          tsupConfig: 'packages/lib/tsup.config.ts',
        },
      },
      'build-2': {
        executor: '@nx-expansion/tsup:build',
        options: {
          entry: ['packages/lib/src/index.ts'],
          tsupConfig: 'packages/lib/tsup.config.ts',
        },
      },
    });

    expect(readJson(tree, 'package.json')).toMatchObject({
      dependencies: {},
      devDependencies: {
        '@swc/core': swcCoreVersion,
        tsup: tsupVersion,
      },
    });
  });

  it('should run successfully, but not update executor', async () => {
    addProjectConfiguration(tree, projectName, {
      root: projectRoot,
      projectType: 'library',
      targets: {
        build: {
          executor: '@fiz/buz:exec',
          options: {
            main: 'packages/lib/src/index.ts',
          },
        },
      },
    });

    await generator(tree, options);

    const projectConfiguration = readProjectConfiguration(tree, projectName);

    expect(tree.exists(join(projectConfiguration.root, 'tsup.config.ts'))).toBe(
      true
    );

    expect(projectConfiguration.targets).toEqual({
      build: {
        executor: '@fiz/buz:exec',
        options: {
          main: 'packages/lib/src/index.ts',
        },
      },
    });

    expect(readJson(tree, 'package.json')).toMatchObject({
      dependencies: {},
      devDependencies: {
        '@swc/core': swcCoreVersion,
        tsup: tsupVersion,
      },
    });
  });
});
