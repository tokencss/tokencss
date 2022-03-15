import load from '@proload/core';
import json from '@proload/plugin-json';

load.use([{
    name: '@proload/plugin-json',
    extensions: ['json', 'jsonc'],
}]);

export async function loadConfig({ cwd }) {
    const result = await load('token', { 
        cwd,
        mustExist: false,
        accept(name: string) {
            return name === 'token.config.json';
        }
    })
    return result?.value;
}
