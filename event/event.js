// check the environment on what to export
import { SC, GLOBAL } from '../core/core.js';
import { SCEvent as BrowserEvent } from './system/browser.js';
import { SCEvent as NodeJSEvent } from './system/nodejs.js';

export const SCEvent = GLOBAL.document? BrowserEvent: NodeJSEvent;
export { CoreQuery } from './system/core_query.js';