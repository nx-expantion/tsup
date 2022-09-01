import { convertNxGenerator } from '@nrwl/devkit';
import convertToTsupGenerator from './generator';

export default convertNxGenerator(convertToTsupGenerator);
