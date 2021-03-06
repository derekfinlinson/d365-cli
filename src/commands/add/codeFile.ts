import * as fs from 'fs';
import * as path from 'path';
import { PluginAssembly } from '../models/pluginAssembly';
import { PluginStep } from '../models/pluginStep';
import prompts from 'prompts';

export default async function codeFile(type: string, filename: string) {
  let steps: PluginStep[] = [];
  let workflowInfo: { name?: string, group?: string };

  if (type === 'plugin') {
    while (true) {
      const step = (await getPluginStep()) as PluginStep;

      steps.push(step);

      const moreSteps = await prompts(
        {
          type: 'confirm',
          name: 'again',
          message: 'would you like to enter an additional step?',
        });

      if (!moreSteps.again) {
        break;
      }
    }
  } else {
    const workflow = await prompts(
      [
        {
          type: 'text',
          name: 'name',
          message: 'enter friendly name:'
        },
        {
          type: 'text',
          name: 'group',
          message: 'enter workflow activity group name:'
        }
      ]
    );

    workflowInfo = workflow;
  }

  await write(type, filename, steps, workflowInfo);

  console.log(`\r\nadded ${type} ${filename}.cs`);

  if (type === 'plugin') {
    console.log('\r\nadd plugin steps to config.json');
  }
}

function getPluginStep(): Promise<prompts.Answers<string>> {
  console.log('\r\nenter plugin step options');

  const questions: prompts.PromptObject[] = [
    {
      type: 'text',
      name: 'name',
      message: 'enter step name:'
    },
    {
      type: 'text',
      name: 'message',
      message: 'enter message (Create, Update, etc):'
    },
    {
      type: 'text',
      name: 'entity',
      message: 'enter entity logical name (use \'none\' if not for a specific entity):'
    },
    {
      type: 'text',
      name: 'configuration',
      message: 'enter unsecure configuration:'
    },
    {
      type: 'text',
      name: 'description',
      message: 'enter description:'
    },
    {
      type: 'select',
      name: 'mode',
      message: 'select mode:',
      choices: [
        {
          title: 'Synchronous',
          value: 0
        },
        {
          title: 'Asynchronous',
          value: 1
        }
      ]
    },
    {
      type: 'number',
      name: 'rank',
      message: 'enter step rank:',
      initial: 1
    },
    {
      type: 'select',
      name: 'stage',
      message: 'select stage:',
      choices: [
        {
          title: 'Pre-validation',
          value: 10
        },
        {
          title: 'Pre-operation',
          value: 20
        },
        {
          title: 'Post-operation',
          value: 40
        }
      ]
    },
    {
      type: 'select',
      name: 'supporteddeployment',
      message: 'select deployment:',
      choices: [
        {
          title: 'Server Only',
          value: 0
        },
        {
          title: 'Microsoft Dynamics 365 Client for Outlook Only',
          value: 1
        },
        {
          title: 'Both',
          value: 2
        }
      ],
      initial: 0
    },
    {
      type: 'text',
      name: 'filteringattributes',
      message: 'enter filtering attributes as comma separated list:'
    }
  ];

  return prompts(questions);
}

async function write(type: string, filename: string, steps: PluginStep[], workflow?: { name?: string, group?: string }) {
  let destinationPath = process.cwd();
  let templatePath = path.resolve(__dirname, 'templates');

  // Check if file already exists
  if (fs.existsSync(path.resolve(destinationPath, `${filename}.cs`))) {
    console.log(`${type} ${filename} already exists`);
    return;
  }

  filename = filename.replace('.cs', '');

  // Get namespace from csproj file
  let files: string[];
  let folder = destinationPath;

  do {
    files = fs.readdirSync(folder).filter(f => f.endsWith('.csproj'));
    folder = path.resolve(folder, '..');
  } while (files.length === 0 && !path.isAbsolute(folder))

  const namespace = files.length === 0 ? 'Xrm' : path.basename(files[0]).replace('.csproj', '');

  let content: string = fs.readFileSync(path.resolve(templatePath, `${type}.cs`), 'utf8');

  content = content.replace('<%= namespace %>', namespace);
  content = content.replace('<%= name %>', filename);

  fs.writeFileSync(path.resolve(destinationPath, `${filename}.cs`), content);

  // Update config.json
  if (fs.existsSync(path.resolve(destinationPath, 'config.json'))) {
    const file: PluginAssembly = JSON.parse(fs.readFileSync(path.resolve(destinationPath, 'config.json'), 'utf8'));

    if (file.types == null) {
      file.types = [];
    }

    const type: any = {
      name: `${namespace}.${filename}`,
      typename: `${namespace}.${filename}`,
      friendlyname: `${namespace}.${filename}`,
      
      steps: steps
    };

    if (workflow != undefined) {
      type.friendlyname = workflow.name;
      type.name = workflow.name;
      type.workflowactivitygroupname = workflow.group;
    }

    file.types.push(type);

    fs.writeFileSync(path.resolve(destinationPath, 'config.json'), JSON.stringify(file), 'utf8');
  }
}
