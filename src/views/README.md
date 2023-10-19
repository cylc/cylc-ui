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


## Subscriptions

Views typically register a subscription with the workflow service.

The workflow service then issues this subscription and enters the data it
returns into the global data store. The view can then access this data from the
store.

The subscription must list all of the types (Workflow, TaskProxies, etc) and
fields (name, status, etc) that the view requires.

In addition to this there are a number of rules that a subscription must match:

* The `id` field must be requested for every type requested.

  This is used by the data store to process deltas.
* You must request the corresponding `pruned` delta for each type you request.
  
  This is used by the data store to remove objects when they drift out of the
  window.
* You must request fields using "fragments" which must follow the standard
  naming pattern (e.g. `WorkflowData`, `CyclePointData`, etc).

  This allows the subscription merging system to avoid requesting duplicate
  data.

  When the subscription is updated, it gets printed to the console, you can
  use this to check merging has worked as intended.
* If you want to walk the family tree (i.e. the hierarchy of families), then
  you must request the following fields of `FamilyProxies`:

  * `__typename`
  * `ancestors { name }`
  * `childTasks { id }`
* You must always request `workflow { reloaded }` if you request any of the
  following types:

  * `Jobs`
  * `Tasks`
  * `Families`
  * `TaskProxies`
  * `FamilyProxies`
  * `Nodes`
  * `Edges`

  The `reloaded` field is a special signal to the data store that tells it to
  wipe all objects of the above type within the workflow and rebuild from
  scratch. This happens when a workflow is reloaded or restarted to handle
  configuration chages (it's easier than trying to get the scheduler to
  send the appropriate updated and pruned deltas).


## Example

For a minimal example view, see the SimpleTree. Note, this is only included
in development builds.
