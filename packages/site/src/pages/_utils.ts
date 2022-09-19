import type { Dirent } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import matter from 'gray-matter';

export const getFiles = async () => {
  // Watch docs directory for HMR
  import.meta.glob('../../../../docs/**/*.md');

  const docs = new URL("../../../../docs/", import.meta.url);
  async function read(dir: URL): Promise<any> {
    const entries = await readdir(dir, { withFileTypes: true });
    return Promise.all(
      entries.map(async (ent: Dirent) => {
        if (ent.isDirectory()) {
          return read(new URL(`./${ent.name}/`, dir));
        }
        const fileURL = new URL(`./${ent.name}`, dir);
        const input = await readFile(fileURL, { encoding: "utf-8" });
        const { data, content } = matter(input)
        const slug = data.permalink?.replace(/^\//, '') ?? fileURL.toString().slice(docs.toString().length, ".md".length * -1).replace('/index', '');
        return {
          fileURL,
          params: {
            slug
          },
          props: { content: `<div><div></div>${content}<div></div></div>`, frontmatter: data }
        };
      })
    );
  }
  const files = await read(docs);
  return files.flat(Infinity);
};
