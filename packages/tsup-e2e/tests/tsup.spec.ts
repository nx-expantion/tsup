import {
  checkFilesExist,
  ensureNxProject,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';

describe('tsup e2e', () => {
  beforeAll(() => {
    ensureNxProject('@nx-expansion/tsup', 'dist/packages/tsup');
  });

  afterAll(() => {
    runNxCommandAsync('reset');
  });

  it('convert to tsup', async () => {
    const project = uniq('tsc-lib');
    await runNxCommandAsync(
      `generate @nrwl/js:lib --no-interactive ${project}`
    );
    const result = await runNxCommandAsync(
      `generate @nx-expansion/tsup:convert-to-tsup ${project}`
    );

    checkFilesExist(`libs/${project}/tsup.config.ts`);
    expect(result.stdout).toContain(`UPDATE libs/${project}/project.json`);
    expect(result.stdout).toContain(`CREATE libs/${project}/tsup.config.ts`);
    expect(result.stdout).toContain(`UPDATE package.json`);
  }, 120000);
});
