import resource from './add/resourceFile';
import script from './add/script';
import code from './add/codeFile';
import test from './add/test-script';

export default function add(type: string, filename: string) {
    switch (type) {
        case 'css':
        case 'html':
            resource(filename, type);
            break;
        case 'script':
            script(filename);
            break;
        case 'test-script':
            test(filename);
            break;
        case 'plugin':
        case 'workflow':
            code(type, filename);
            break;
        default:
            console.log('unknown file type. Enter css, html, script, test-script, plugin or workflow');
            break;
    }
}