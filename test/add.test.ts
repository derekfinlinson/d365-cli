import prompts from 'prompts';
import resourceFile from '../src/commands/add/resourceFile';
import script from '../src/commands/add/script';
import testScript from '../src/commands/add/test-script';
import * as fs from 'fs';
import * as path from 'path';

const projectPath = path.resolve(__dirname, '__add__');

beforeEach(() => {
    fs.mkdirSync(projectPath);
    process.chdir(projectPath);

    fs.writeFileSync(path.relative(projectPath, 'config.json'), JSON.stringify({ webResources: [], entries: {} }));
});

afterEach(() => {
    process.chdir(path.resolve(__dirname));

    const cleanProjectPath = (folder: string) => {
        fs.readdirSync(folder).forEach(f => {
            if (fs.lstatSync(path.resolve(folder, f)).isFile()) {
                fs.unlinkSync(path.resolve(folder, f));
            } else {
                cleanProjectPath(path.resolve(folder, f));
            }
        });

        fs.rmdirSync(folder);
    };

    cleanProjectPath(projectPath);
});

describe('add resource files', () => {
    test('add css file', async () => {
        const answers = [
            'new_style.css',
            'Style.css'
        ];

        prompts.inject(answers);

        await resourceFile('style', 'css');

        expect(fs.existsSync(path.resolve(projectPath, 'src', 'css', 'style.css'))).toBeTruthy();

        const config = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'config.json'), 'utf8'));

        expect(config.webResources[0].path).toBe('./dist/css/style.css');
        expect(config.webResources[0].name).toBe(answers[0]);
        expect(config.webResources[0].displayname).toBe(answers[1]);
        expect(config.webResources[0].type).toBe('CSS');
    });

    test('add html file', async () => {
        const answers = [
            'new_index.html',
            'Style.html'
        ];

        await resourceFile('index', 'html');

        expect(fs.existsSync(path.resolve(projectPath, 'src', 'html', 'index.html'))).toBeTruthy();

        const config = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'config.json'), 'utf8'));

        expect(config.webResources[0].path).toBe('./dist/html/index.html');
        expect(config.webResources[0].name).toBe(answers[0]);
        expect(config.webResources[0].displayname).toBe(answers[1]);
        expect(config.webResources[0].type).toBe('HTML');
    });

    
});

describe('add script files', () => {
    test('add form script file without test', async () => {
        const answers = [
            'form',
            'new_script.js',
            'Script.js',
            false
        ];

        prompts.inject(answers);

        await script('Form');

        expect(fs.existsSync(path.resolve(projectPath, 'src', 'scripts', 'Form.ts'))).toBeTruthy();

        const config = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'config.json'), 'utf8'));

        expect(config.webResources[0].path).toBe('./dist/scripts/Form.js');
        expect(config.webResources[0].name).toBe(answers[0]);
        expect(config.webResources[0].displayname).toBe(answers[1]);
        expect(config.webResources[0].type).toBe('JavaScript');

        expect(fs.existsSync(path.resolve(projectPath, 'test', 'scripts', 'form.test.ts'))).toBeFalsy();
    });

    test('add form script file with test', async () => {
        const answers = [
            'form',
            'new_script.js',
            'Script.js',
            true
        ];

        prompts.inject(answers);

        await script('Form');

        expect(fs.existsSync(path.resolve(projectPath, 'src', 'scripts', 'Form.ts'))).toBeTruthy();

        const config = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'config.json'), 'utf8'));

        expect(config.webResources[0].path).toBe('./dist/scripts/Form.js');
        expect(config.webResources[0].name).toBe(answers[0]);
        expect(config.webResources[0].displayname).toBe(answers[1]);
        expect(config.webResources[0].type).toBe('JavaScript');

        expect(fs.existsSync(path.resolve(projectPath, 'test', 'scripts', 'Form.test.ts'))).toBeTruthy();

        const testContent = fs.readFileSync(path.resolve(projectPath, 'test', 'scripts', 'Form.test.ts'), 'utf8');

        expect(testContent).toContain('../../src/scripts/Form');
        expect(testContent).toContain('Form Tests');
    });

    test('add ribbon script file without test', async () => {
        const answers = [
            'ribbon',
            'new_script.js',
            'Script.js',
            false
        ];

        prompts.inject(answers);

        await script('Ribbon');

        expect(fs.existsSync(path.resolve(projectPath, 'src', 'scripts', 'Ribbon.ts'))).toBeTruthy();

        const config = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'config.json'), 'utf8'));

        expect(config.webResources[0].path).toBe('./dist/scripts/Ribbon.js');
        expect(config.webResources[0].name).toBe(answers[0]);
        expect(config.webResources[0].displayname).toBe(answers[1]);
        expect(config.webResources[0].type).toBe('JavaScript');

        expect(fs.existsSync(path.resolve(projectPath, 'test', 'scripts', 'Ribbon.test.ts'))).toBeFalsy();
    });

    test('add ribbon script file with test', async () => {
        const answers = [
            'ribbon',
            'new_script.js',
            'Script.js',
            true
        ];
       
        prompts.inject(answers);

        await script('Ribbon');

        expect(fs.existsSync(path.resolve(projectPath, 'src', 'scripts', 'Ribbon.ts'))).toBeTruthy();

        const config = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'config.json'), 'utf8'));

        expect(config.webResources[0].path).toBe('./dist/scripts/Ribbon.js');
        expect(config.webResources[0].name).toBe(answers[0]);
        expect(config.webResources[0].displayname).toBe(answers[1]);
        expect(config.webResources[0].type).toBe('JavaScript');

        expect(fs.existsSync(path.resolve(projectPath, 'test', 'scripts', 'Ribbon.test.ts'))).toBeTruthy();

        const testContent = fs.readFileSync(path.resolve(projectPath, 'test', 'scripts', 'Ribbon.test.ts'), 'utf8');

        expect(testContent).toContain('../../src/scripts/Ribbon');
        expect(testContent).toContain('Ribbon Tests');
    });

    test('add test-script file', () => {
        testScript('Form');

        expect(fs.existsSync(path.resolve(projectPath, 'test', 'scripts', 'Form.test.ts'))).toBeTruthy();

        const content = fs.readFileSync(path.resolve(projectPath, 'test', 'scripts', 'Form.test.ts'), 'utf8');

        expect(content).toContain('../../src/scripts/Form');
        expect(content).toContain('Form Tests');
    });
});