import {
  checkFilesExist,
  ensureNxProject,
  readJson,
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
    const convertResult = await runNxCommandAsync(
      `generate @nx-expansion/tsup:convert-to-tsup ${project}`
    );

    checkFilesExist(`libs/${project}/tsup.config.ts`);
    expect(convertResult.stdout).toContain(
      `UPDATE libs/${project}/project.json`
    );
    expect(convertResult.stdout).toContain(
      `CREATE libs/${project}/tsup.config.ts`
    );
    expect(convertResult.stdout).toContain(`UPDATE package.json`);

    const buildResult = await runNxCommandAsync(`build ${project}`, {
      silenceError: true,
    });

    console.log(buildResult.stdout);
    console.log(buildResult.stderr);

    expect(buildResult.stdout).toContain('Build success in');

    checkFilesExist(`dist/libs/${project}/README.md`);
    checkFilesExist(`dist/libs/${project}/package.json`);
    checkFilesExist(`dist/libs/${project}/index.js`);
    checkFilesExist(`dist/libs/${project}/index.js.map`);
    checkFilesExist(`dist/libs/${project}/index.mjs`);
    checkFilesExist(`dist/libs/${project}/index.mjs.map`);
    expect(readJson(`dist/libs/${project}/package.json`)).toEqual({
      name: `@proj/${project}`,
      version: '0.0.1',
      type: 'commonjs',
      main: 'index.js',
      typings: 'index.d.ts',
      module: 'index.mjs',
    });
  }, 120000);
});
