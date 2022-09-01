import { ExecutorContext, logger } from '@nrwl/devkit';
import { Entry } from '../../executors/build/schema';
import { rm } from 'fs/promises';
import { execSync } from 'child_process';
import { NormalizedBuildExecutorSchema } from '../../executors/build/executor';

interface TsupCommandOptions {
  entry: Entry;
  tsupConfig: string;
  outDir: string;
  tsConfig?: string;
}

function getTsupCommand({
  entry,
  tsConfig,
  tsupConfig,
  outDir,
}: TsupCommandOptions) {
  const argv = ['npx', 'tsup'];

  if (Array.isArray(entry)) {
    argv.push(...entry);
  } else {
    argv.push(
      ...Object.entries(entry).flatMap(([key, file]) => [
        `--entry.${key}`,
        file,
      ])
    );
  }

  argv.push('--out-dir', outDir);
  argv.push('--config', tsupConfig);

  if (tsConfig) {
    argv.push('--tsconfig', tsConfig);
  }

  return argv.join(' ');
}

export async function compileTsup(
  context: ExecutorContext,
  options: NormalizedBuildExecutorSchema,
  postCompilationCallback?: () => Promise<void>
): Promise<{ success: boolean }> {
  logger.log(`Compiling with tsup for ${context.projectName}...`);

  if (options.clean) {
    await rm(options.outputPath, { recursive: true, force: true });
  }

  const command = getTsupCommand({
    entry: options.entry,
    tsConfig: options.tsConfig,
    tsupConfig: options.tsupConfig,
    outDir: options.outputPath,
  });
  logger.log(command);
  const tsupCommandLog = execSync(command).toString();

  logger.log(tsupCommandLog);
  const isCompileSuccess = /Build success in [\d]+ms/.test(tsupCommandLog);

  await postCompilationCallback?.();

  return {
    success: isCompileSuccess,
  };
}
