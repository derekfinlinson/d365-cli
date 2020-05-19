import prompts from 'prompts';
import webresource from '../src/commands/create/webresource';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('inquirer');

const projectPath = path.resolve(__dirname, '__create__');

beforeEach(() => {
  fs.mkdirSync(projectPath);
  process.chdir(projectPath);
});

afterEach(() => {
  fs.readdirSync(projectPath).forEach(f => {
    fs.unlinkSync(path.resolve(projectPath, f));
  });

  process.chdir(path.resolve(__dirname));
  fs.rmdirSync(projectPath);
});

describe('create a web resource project', () => {
  test('creates project with user authentication', async () => {
    const answers = {
      namespace: 'Org',
      package: 'npm',
      server: 'https://org.crm.dynamics.com',
      authType: 'user',
      username: 'user@org.onmicrosoft.com',
      password: 'password',
      solution: 'D365Solution'
    };

    const prompt = jest.spyOn(prompts, 'prompt');

    prompt.mockResolvedValue(answers);

    await webresource();

    const expectedFiles = [
      'package.json',
      'config.json',
      'tsconfig.json',
      '.babelrc',
      'webpack.config.js',
      'creds.json'
    ];

    expectedFiles.forEach(f => {
      expect(fs.existsSync(path.resolve(projectPath, f))).toBeTruthy();
    });

    const webpackContent = fs.readFileSync(path.resolve(projectPath, 'webpack.config.js'), 'utf8');

    expect(webpackContent).toContain(answers.namespace);

    const credsContent = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'creds.json'), 'utf8'));

    expect(credsContent.server).toBe(answers.server);
    expect(credsContent.username).toBe(answers.username);
    expect(credsContent.password).toBe(answers.password);
    expect(credsContent.solution).toBe(answers.solution);
  });

  test('creates project with client id/secret authentication', async () => {
    const answers = {
      namespace: 'Jt',
      package: 'npm',
      server: 'https://org.crm.dynamics.com',
      authType: 'client',
      clientId: 'id',
      clientSecret: 'secret',
      solution: 'D365Solution'
    };

    const prompt = jest.spyOn(prompts, 'prompt');

    prompt.mockResolvedValue(answers);

    await webresource();

    const expectedFiles = [
      'package.json',
      'config.json',
      'tsconfig.json',
      '.babelrc',
      'webpack.config.js',
      'creds.json'
    ];

    expectedFiles.forEach(f => {
      expect(fs.existsSync(path.resolve(projectPath, f))).toBeTruthy();
    });

    const webpackContent = fs.readFileSync(path.resolve(projectPath, 'webpack.config.js'), 'utf8');

    expect(webpackContent).toContain(answers.namespace);

    const credsContent = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'creds.json'), 'utf8'));

    expect(credsContent.server).toBe(answers.server);
    expect(credsContent.clientId).toBe(answers.clientId);
    expect(credsContent.clientSecret).toBe(answers.clientSecret);
    expect(credsContent.solution).toBe(answers.solution);
  });
});

describe('create assembly project', () => {
  test('create plugin project', () => {

  });
});