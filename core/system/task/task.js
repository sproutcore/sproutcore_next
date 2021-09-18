import { SCObject } from '../object.js';


/**
  Represents a single task which can be run by a task queue. Note that tasks
  are actually allowed to add themselves back onto the queue if they did not/
  might not finish.
*/
export const Task = SCObject.extend({
  run: function (queue) {
    // if needed, you could put the task back on the queue for later finishing.
  }
})