import { SC as core, GLOBAL } from './core/core.js';
import * as event from './event/event.js';
import * as responder from './responder/responder.js';
import * as view from './view/view.js';
import * as datastore from './datastore/datastore.js';

export const SproutCore = core;

// this is done as the SC.mixin tries hasOwnProperty which is not present on 
// the imported name spaces
[event, responder, view, datastore].forEach(fw => {
  Object.keys(fw).forEach(k => {
    SproutCore[k] = fw[k];
  });
});

export const SC = SproutCore;

GLOBAL.SC = GLOBAL.Sproutcore = SC.mixin(GLOBAL.SC, SproutCore);