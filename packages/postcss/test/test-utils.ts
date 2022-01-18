import fs from 'fs/promises';
import { URL, fileURLToPath } from 'url';
import postcss from 'postcss';

export function setupFixture(fixture: string) {
    const cwd = new URL(`./fixtures/${fixture}/`, import.meta.url);

    async function readFile(relativeUrl: string) {
        const path = fileURLToPath(new URL(relativeUrl, cwd));
        return fs.readFile(path)
    }
    async function readTextFile(relativeUrl: string) {
        return readFile(relativeUrl).then(res => res.toString());
    }
    async function readJsonFile(relativeUrl: string) {
        const contents = await readTextFile(relativeUrl);
        return JSON.parse(contents);
    }
    
    return {
        cwd: fileURLToPath(cwd),
        fs: { 
            readFile,
            readTextFile,
            readJsonFile,
        },
        postcss: {
            async run(input: string, { plugins = [] } = {}) {
                if (input.startsWith('./')) {
                    const from = fileURLToPath(new URL(input, cwd));
                    const to = fileURLToPath(new URL(`out-${input}`, cwd));
                    const css = await readTextFile(input);
                    return postcss(plugins).process(css, { from, to })
                } else {
                    return postcss(plugins).process(input, { from: undefined })
                }
            }
        }
    }
}

export function setup() {
    return {
        postcss: {
            async run(input: string, { plugins = [] } = {}) {
                return postcss(plugins).process(input, { from: undefined })
            }
        }
    }
}
