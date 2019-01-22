import { onLoad } from '../../src/scripts/<%= filename %>';
import { XrmMockGenerator } from 'xrm-mock';

describe('<%= filename %> Tests', () => {
    beforeEach(() => {
        XrmMockGenerator.initialise();
    });

    test('test onLoad', () => {
        onLoad();
    });
});