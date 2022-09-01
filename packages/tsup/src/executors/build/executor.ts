import { ExecutorContext, logger, ProjectGraphProjectNode } from '@nrwl/devkit';
import { CopyAssetsHandler } from '../../utils/copy-assets-handler';
import { compileTsup } from '../../utils/tsup/compile-tsup';
import { updatePackageJson } from '../../utils/update-package-json';
import { BuildExecutorSchema } from './schema';

export interface NormalizedBuildExecutorSchema extends BuildExecutorSchema {
  project: ProjectGraphProjectNode;
  projectRoot: string;
}

function normalizeOptions(
  options: BuildExecutorSchema,
  context: ExecutorContext
): NormalizedBuildExecutorSchema | null {
  if (context.projectGraph == null || context.projectName == null) {
    logger.fatal(`projectGraph and projectName are required.`);
    return null;
  }

  const project = context.projectGraph.nodes[context.projectName];

  const projectRoot: string = project.data.root;

  return {
    ...options,
    project,
    projectRoot,
  };
}

function processAssetsOnce(
  assetHandler: CopyAssetsHandler,
  options: NormalizedBuildExecutorSchema,
  context: ExecutorContext
) {
  return async () => {
    await assetHandler.processAllAssetsOnce();
    updatePackageJson(options, context);
  };
}

export default async function runExecutor(
  _options: BuildExecutorSchema,
  context: ExecutorContext
) {
  const options = normalizeOptions(_options, context);

  if (options == null) {
    return {
      success: false,
    };
  }

  const assetHandler = new CopyAssetsHandler({
    projectDir: options.projectRoot,
    rootDir: context.root,
    outputDir: _options.outputPath,
    assets: _options.assets,
  });

  return compileTsup(
    context,
    options,
    processAssetsOnce(assetHandler, options, context)
  );
}
