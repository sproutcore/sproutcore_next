

# small ideas

- using service worker for data storage perhaps, or data source.
  Issue might be that it is not available in private mode, so there should
  also be a direct mode somehow
- using indexed db as data-communication between view and controller layer?
- Cache interface could also be used for this, though it is not intended
  to be used like that, as it is more for offline mode and static resources
- split views in renderers (which can then be on the main loop)
  and the main view control structure?
- use a different system for naming than introspection of the global namespace...

# View system
There are a few options to use multithreaded stuff:
1. Entire view system in main thread => all communication with controllers through messaging
2. Only do renderers in main thread and have the thread-gap in the view system itself.

Biggest issue with the view system is that currently all events are done on the main view
and not on the renderer. This almost requires in a way to have the entire view layer
and corresponding responder system in the main thread.
There is one main issue with this: there are certain techniques around delegates
which do not play nice with this.
question is what the delay is in the postmessage system. It seems good enough to
put the entire view system in a separate thread.

The eventing system needs to be perhaps two sided...

In any case, there should be a kind of binding which has the postMessage and onMessage
part... Perhaps it is even better to handle this through the main responder system
anyhow...
As in... the point is also that you need to be able to have a special binding
which uses the responder system (?) to do the messaging...
it becomes an evented binding...

Another thing: routes: also something only available to the main thread, but should be passed
on to the statechart somehow...


# workers...
It looks like most of the app, including the state chart could work inside a worker,
and only the view system could run inside the main thread. 
The core should then run inside both, which also means not depending on window, or at least be flexible
with globals
Also, in order to do proper bindings, we would need cross worker bindings, as in:
- it would be good that data bindings can be as much "transparent" as possible. It would be interesting to have existing
  applications split up automatically, because the binding itself understands that there might be a worker behind it.
  