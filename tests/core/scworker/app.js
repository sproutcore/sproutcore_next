import { SC } from '/core/core.js';

self.myObject = SC.Object.create({
  test: 'mytestval',
});

SC.onload = () => {
  // now setup something that can be tested for a observable setup...


}

console.log('add_to_worker loaded');