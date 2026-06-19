// test fallback
import { readFileSync } from 'fs';
const content = readFileSync('./server.ts', 'utf-8');
const fallbackFnStr = content.substring(content.indexOf('function generateDynamicFallback'), content.indexOf('let keyIndex = 0;'));
eval(fallbackFnStr + `\nconsole.log(generateDynamicFallback('x=10\\nprint(x)', 'Test'));`);
