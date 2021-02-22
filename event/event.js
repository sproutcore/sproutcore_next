// check the environment on what to export
import { SC, GLOBAL } from '../core/core.js';
import { SCEvent as BrowserEvent } from './system/browser_event.js';
import { SCEvent as NodeJSEvent } from './system/nodejs_event.js';
import './system/ready.js'; // trigger onload 

export const SCEvent = GLOBAL.document? BrowserEvent: NodeJSEvent;
// export const SCEvent = BrowserEvent;

export { CoreQuery } from './system/core_query.js';
export { browser } from './system/browser.js';
export { MODIFIER_KEYS, FUNCTION_KEYS } from './system/browser_event.js';
export { UserDefaults, userDefaults } from './system/user_defaults.js';