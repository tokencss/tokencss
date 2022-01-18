import { promises as fs } from 'fs';
import { fileURLToPath, URL } from 'url';
import schema from '@tokencss/schema';

fs.writeFile(fileURLToPath(new URL("./public/schema.json", import.meta.url)), JSON.stringify(schema, null, 2))
