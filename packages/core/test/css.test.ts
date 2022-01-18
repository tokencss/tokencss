import tokens from './fixtures/scales/token.config.json';
import { resolveTokens } from '../src/tokens';
import { serializeTokensToCSS } from '../src/css';

console.log(serializeTokensToCSS(resolveTokens(tokens)));
