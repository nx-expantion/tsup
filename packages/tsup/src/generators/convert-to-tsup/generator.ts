import {
  GeneratorCallback,
  installPackagesTask,
  ProjectConfiguration,
  readJson,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import { join } from 'path';
import { PackageJson } from '../../utils/package-json';
import { addSwcDependencies } from '../../utils/tsup/add-swc-dependencies';
import { addTsupConfig } from '../../utils/tsup/add-tsup-config';
import { addTsupDependencies } from '../../utils/tsup/add-tsup-dependencies';
import { ConvertToTsupGeneratorSchema } from './schema';

type NormalizedSchema = Required<ConvertToTsupGeneratorSchema>;

function normalizeOptions(
  options: ConvertToTsupGeneratorSchema
): NormalizedSchema {
  return {
    targets: ['build'],
    ...options,
  };
}

function updateProjectBuildTargets(
  tree: Tree,
  projectConfiguration: ProjectConfiguration,
  projectName: string,
  projectTargets: string[]
) {
  const entry: string[] = [];
  for (const target of projectTargets) {
    const targetConfiguration = projectConfiguration.targets?.[target];
    if (
      !targetConfiguration ||
      !/^@nrwl\/js:(tsc|swc)$/.test(targetConfiguration.executor)
    ) {
      continue;
    }

    targetConfiguration.executor = '@nx-expansion/tsup:build';
    targetConfiguration.options = {
      entry: targetConfiguration.options?.main
        ? [targetConfiguration.options.main]
        : [],
      outputPath: targetConfiguration.options?.outputPath,
      tsConfig: targetConfiguration.options?.tsConfig,
      tsupConfig: join(projectConfiguration.root, 'tsup.config.ts'),
      assets: targetConfiguration.options?.assets,
    };
  }

  updateProjectConfiguration(tree, projectName, projectConfiguration);

  return {
    entry,
  };
}

async function checkTsupDependencies(
  tree: Tree,
  projectConfiguration: ProjectConfiguration
): Promise<GeneratorCallback> {
  const isTsupConfigPresent = tree.exists(
    join(projectConfiguration.root, 'tsup.config.ts')
  );

  const packageJson = readJson<PackageJson>(tree, 'package.json');

  const hasSwcDependency = packageJson.dependencies?.['@swc/core'] != null;

  const hasTsupDependency = packageJson.devDependencies?.['tsup'] != null;

  if (!isTsupConfigPresent) {
    addTsupConfig(tree, projectConfiguration.root);
  }

  if (!hasSwcDependency) {
    addSwcDependencies(tree);
  }

  if (!hasTsupDependency) {
    addTsupDependencies(tree);
  }

  return () => {
    if (!hasSwcDependency || !hasTsupDependency) {
      installPackagesTask(tree);
    }
  };
}

export default async function convertToTsupGenerator(
  tree: Tree,
  schema: ConvertToTsupGeneratorSchema
): Promise<void> {
  const options = normalizeOptions(schema);

  const projectConfiguration = readProjectConfiguration(tree, options.project);

  updateProjectBuildTargets(
    tree,
    projectConfiguration,
    options.project,
    options.targets
  );

  await checkTsupDependencies(tree, projectConfiguration);
}
