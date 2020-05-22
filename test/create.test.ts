import prompts from 'prompts';
import webresource from '../src/commands/create/webresource';
import * as fs from 'fs';
import * as path from 'path';

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
    const answers = [
      'Org',
      'npm',
      'https://org.crm.dynamics.com',
      'user',
      'user@org.onmicrosoft.com',
      'password',
      'D365Solution'
    ];

    prompts.inject(answers);
    
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

    expect(webpackContent).toContain(answers[0]);

    const credsContent = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'creds.json'), 'utf8'));

    expect(credsContent.server).toBe(answers[2]);
    expect(credsContent.username).toBe(answers[4]);
    expect(credsContent.password).toBe(answers[5]);
    expect(credsContent.solution).toBe(answers[6]);
  });

  test('creates project with client id/secret authentication', async () => {
    const answers = [
      'Org',
      'npm',
      'https://org.crm.dynamics.com',
      'client',
      'id',
      'secret',
      'D365Solution'
    ];

    prompts.inject(answers);

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

    expect(webpackContent).toContain(answers[0]);

    const credsContent = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'creds.json'), 'utf8'));

    expect(credsContent.server).toBe(answers[2]);
    expect(credsContent.clientId).toBe(answers[4]);
    expect(credsContent.clientSecret).toBe(answers[5]);
    expect(credsContent.solution).toBe(answers[6]);
  });
});

describe('create assembly project', () => {
  test('create plugin project', () => {

  });
});