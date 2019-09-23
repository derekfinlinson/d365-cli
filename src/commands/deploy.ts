import { webresource } from './deploy/webresource';
import { assembly } from './deploy/assembly';

export default function deploy(type: string, files?: string) {
  switch (type) {
    case 'webresource':
      webresource(files);
      break;
    case 'plugin':
      assembly('plugin');
      break;
    case 'workflow':
      assembly('workflow');
      break;
    default:
      console.error('Unknown deploy type. Enter webresource, workflow or plugin');
      break;
  }
}