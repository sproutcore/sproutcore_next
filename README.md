# SproutCore Next

This is a very basic first start of trying to modernize SproutCore, using modern elements of ES6+ JS where possible.

# Author
Maurits Lamers

# Goals
- ES6 modules
- Works without buildtools
- Works in NodeJS
- Possibility in the future to use workers to run parts of the applications (cross-worker binding implemented)
- different layout of subframeworks
- Limited dependency on global property paths

# Current status
- Implemented the old runtime system 
- Array and Object controllers included

# How to use

Check out the repository and the import `SC` from the core.js file in the core folder:

```
import { SC } from './core/core.js
```

# Notes
While it seems that the ES6 class system is a good fit for SproutCore it would break certain functionality of the framework itself
as well as that syntactically it will not be straightforward. 
One of the aspects of SC is that on both extending and creating of objects properties can be added or overwritten using a simple 
syntax using object literals. Many aspects that make SC as it is, such as the `.property` and `.observes` as well as the `valueBinding` 
system are all setup during both the extend and create process. Also less visible functionality such as `concatenatedProperties` are applied
during the create and extend process. 
Much of the heavy lifting of this functionality is done during the extending process, and that is exactly where things get difficult.

In the current ES6 classes, there is no possibility to feed the extend process an object literal composed of both methods and properties.
There is also no way to do heavy lifting during the extend in another way than the current implementation already does.

In this approach the current implementation is modularized using the ES6 module system, but no ES6 classes are used, just the "old fashioned"
prototype system.
In an interesting twist of terms, this approach has given me the impression to be performing a bit better as well than the class based approaches 
I wrote, though I haven't done extensive testing.

# License
MIT
