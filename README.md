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
