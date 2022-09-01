import { ExecutorContext, readJsonFile, writeJsonFile } from '@nrwl/devkit';
import { existsSync } from 'fs';
import { basename, join } from 'path';
import { NormalizedBuildExecutorSchema } from '../executors/build/executor';
import { PackageJson } from './package-json';
import { suppressError } from './suppress-error';

export function updatePackageJson(
  options: NormalizedBuildExecutorSchema,
  context: ExecutorContext
): void {
  const projectPackageJsonPath = join(
    context.root,
    options.projectRoot,
    'package.json'
  );

  const packageJson = suppressError(
    () => readJsonFile<PackageJson>(projectPackageJsonPath),
    {
      name: context.projectName,
    }
  );

  // use first entry
  const firstEntry = Array.isArray(options.entry) ? options.entry[0] : null;

  if (firstEntry) {
    const mainFileBasename = basename(firstEntry).replace(/\.[tj]s$/, '');

    const mainFile = `${mainFileBasename}.js`;
    const typingsFile = `${mainFileBasename}.d.ts`;
    const moduleFile = `${mainFileBasename}.mjs`;

    if (existsSync(join(options.outputPath, mainFile))) {
      packageJson.main ??= mainFile;
    }
    if (existsSync(join(options.outputPath, typingsFile))) {
      packageJson.typings ??= typingsFile;
    }
    if (existsSync(join(options.outputPath, moduleFile))) {
      packageJson.module ??= moduleFile;
    }
  }

  writeJsonFile(join(options.outputPath, 'package.json'), packageJson);
}
