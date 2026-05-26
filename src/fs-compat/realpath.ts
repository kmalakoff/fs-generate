import type fs from 'fs';
import { default as realpath } from 'fs.realpath';

export default realpath as unknown as typeof fs.realpath;
