import * as path from 'path';
import { generateBundles } from './index';

generateBundles([{
  name: 'testBundle',
  sourceDir: path.resolve(__dirname, '../dist'),
  destDir: path.resolve(__dirname, '..')
}]);