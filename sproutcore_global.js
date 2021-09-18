// import { SC as core, GLOBAL } from './core/core.js';
// import * as event from './event/event.js';
// import * as responder from './responder/responder.js';
// import * as statechart from './statechart/statechart.js';
// import * as view from './view/view.js';
// import * as datastore from './datastore/datastore.js';
// import * as desktop from './desktop/desktop.js';
// import * as ajax from './ajax/ajax.js';

// export const SproutCore = core;

// // this is done as the SC.mixin tries hasOwnProperty which is not present on 
// // the imported name spaces
// [event, responder, statechart, view, datastore, desktop, ajax].forEach(fw => {
//   Object.keys(fw).forEach(k => {
//     SproutCore[k] = fw[k];
//   });
// });

import { SC } from './sproutcore.js';

export const SC = SproutCore;

GLOBAL.SC = GLOBAL.Sproutcore = SC.mixin(GLOBAL.SC, SproutCore);
// backwards compat
GLOBAL.YES = true;
GLOBAL.NO = false;