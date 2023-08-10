# Views

Views are top-level entry points into the app:

* Each view can be used standalone.
* Each view has a URL (see `src/router` for registration).
* Some views can also be used as "tabs" in the "Workspace" view.

The Workspace view is a special composite view which provides the flexible tab
layout. Other views (e.g. the Tree, Table and Graph views) can be opened as
tabs within the Workspace view.


## Toolbars

Use the `ViewToolbar` component for view-specific toolbars.


## Components

You may want to take the generic part of a view and turn it into a reusable
component.

E.G. the Tree *view* displays Cylc cycles/tasks/jobs in a collapsible hierarchy.
It uses the Tree *component* which provides the generic tree logic e.g.
indentation, expand/collapse, etc. This Tree *component* is also used by
the Workflows *view*.
