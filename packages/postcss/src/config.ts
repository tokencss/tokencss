import load from '@proload/core';
// import json from '@proload/plugin-json';
// load.use([json]);

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
