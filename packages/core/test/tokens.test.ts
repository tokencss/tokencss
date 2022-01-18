import tokens from './fixtures/scales/token.config.json';
import { resolveTokens } from '../src/tokens';

console.log(resolveTokens(tokens)['shadow.xl'].value)
