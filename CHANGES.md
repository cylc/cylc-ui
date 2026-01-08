# Selected Cylc UI Changes

Internal changes that do not directly affect users may not be listed here.  For
all changes see the [closed
milestones](https://github.com/cylc/cylc-ui/milestones?state=closed) for each
release.

<!--
NOTE: Do not add entries here, use towncrier (installed via pip) fragments instead:
$ towncrier create <PR-number>.<feat|fix>.md --content "Short description"
-->

<!-- towncrier release notes start -->

## cylc-ui-2.12.1 (Released 2026-01-08)

No significant changes.

## cylc-ui-2.12.0 (Released 2026-01-08)

### 🚀 Enhancements

[#2361](https://github.com/cylc/cylc-ui/pull/2361) - An information icon containing workflow details (via hover over) has been added to the workspace toolbar.

[#2370](https://github.com/cylc/cylc-ui/pull/2370) - Task filtering improvements:
  * Task ID filtering now supports globs.
  * Task state filtering now supports queued, runahead, wallclock, xtriggered, retry, held and skip selectors.
  * Task filtering controls have been redesigned.

[#2372](https://github.com/cylc/cylc-ui/pull/2372) - Improved the appearance of the Info view.

[#2378](https://github.com/cylc/cylc-ui/pull/2378) - Added held and retry icons to the workflows sidebar, these will indicate if any n=0 tasks are in these states.

[#2380](https://github.com/cylc/cylc-ui/pull/2380) - Made the workflows sidebar more compact and added an option called "Compact Mode" to reduce it further.

[#2381](https://github.com/cylc/cylc-ui/pull/2381), [#2396](https://github.com/cylc/cylc-ui/pull/2396) - Added a "last activity" column to the workflows table.

[#2392](https://github.com/cylc/cylc-ui/pull/2392) - Expanded the guide section and added it as a view so it can be opened as a tab.

[#2394](https://github.com/cylc/cylc-ui/pull/2394) - The command editor can now be opened in a new tab.

### 🔧 Fixes

[#2377](https://github.com/cylc/cylc-ui/pull/2377) - Fixed the play/pause/stop buttons in the toolbar being incorrectly disabled when switching between workflows.

## cylc-ui-2.11.0 (Released 2025-11-27)

### 🚀 Enhancements

[#2290](https://github.com/cylc/cylc-ui/pull/2290) - Added tooltip to distinguish between multiple log view tabs.

[#2331](https://github.com/cylc/cylc-ui/pull/2331) - Improved how task states are displayed in the sidebar.

[#2339](https://github.com/cylc/cylc-ui/pull/2339) - In the sidebar, don't include task states for stopped workflows in any parent state totals.

### 🔧 Fixes

[#2284](https://github.com/cylc/cylc-ui/pull/2284) - Fixed Log & Info commands erroneously showing for families.

[#2335](https://github.com/cylc/cylc-ui/pull/2335) - The play, pause and stop buttons in the workspace toolbar will now "grey out" if you do not have the permissions to run these commands.

[#2349](https://github.com/cylc/cylc-ui/pull/2349) - Fixed workflow sorting bug in the sidebar.

## cylc-ui-2.10.0 (Released 2025-10-01)

### 🚀 Enhancements

[#2265](https://github.com/cylc/cylc-ui/pull/2265) - Improved the legibility of job details in the tree view and added a job details menu to the log view.

[#2317](https://github.com/cylc/cylc-ui/pull/2317) - Show estimated finish times of running jobs in the tree and table views.

## cylc-ui-2.9.0 (Released 2025-09-04)

### 🚀 Enhancements

[#2078](https://github.com/cylc/cylc-ui/pull/2078) - Log view word wrap setting is now saved.

[#2261](https://github.com/cylc/cylc-ui/pull/2261) - Add a skip mode modifier for the task icon

### 🔧 Fixes

[#2078](https://github.com/cylc/cylc-ui/pull/2078) - Fixed log view word wrap not working in all cases.

## cylc-ui-2.8.0 (Released 2025-07-23)

### 🚀 Enhancements

[#2017](https://github.com/cylc/cylc-ui/pull/2017) - Added option to set automatic scrolling in log view

[#2025](https://github.com/cylc/cylc-ui/pull/2025) - Added conditional default log file based on job outcome

[#2102](https://github.com/cylc/cylc-ui/pull/2102) - Added xtriggers and run mode to the task info view.

[#2135](https://github.com/cylc/cylc-ui/pull/2135) - Show more Cylc version info in the sidebar.

[#2169](https://github.com/cylc/cylc-ui/pull/2169) - Added workflow warning information:
  - A dismissable warning icon in the workflows sidebar and workspace toolbar which illuminates when a warning is present.
  - All warnings are listed in events section of the dashboard.

[#2176](https://github.com/cylc/cylc-ui/pull/2176) - Workspace tab layout is now remembered beyond the current browser session.

[#2190](https://github.com/cylc/cylc-ui/pull/2190) - Added icon modifiers for tasks waiting on failure-retry, xtriggers or wallclock.

[#2222](https://github.com/cylc/cylc-ui/pull/2222) - The Edit Runtime form now supports multi-line environment variables.

### 🔧 Fixes

[#2163](https://github.com/cylc/cylc-ui/pull/2163) - Fixed sorting controls appearing in wrong tab when multiple analysis view tabs are open.

[#2174](https://github.com/cylc/cylc-ui/pull/2174) - Fixed spurious error when running a command on multiple workflows.

## cylc-ui-2.7.0 (Released 2025-01-08)

### 🚀 Enhancements

[#1886](https://github.com/cylc/cylc-ui/pull/1886) - Added an info view to display task information including metadata, prerequisites and outputs.

[#1966](https://github.com/cylc/cylc-ui/pull/1966) - Added copy-to-clipboard buttons:
  - the ID of a workflow/task/etc from the command menu
  - the log file path in the Log view

[#1973](https://github.com/cylc/cylc-ui/pull/1973) - Add a button to toggle families on and off in the tree view.

[#1974](https://github.com/cylc/cylc-ui/pull/1974) - Add a "Select All" action in the task state filter.

[#1982](https://github.com/cylc/cylc-ui/pull/1982) - Add link to Jupyter Lab from the Dashboard (if Jupyter Lab is installed).

[#2016](https://github.com/cylc/cylc-ui/pull/2016) - Show [flow numbers](https://cylc.github.io/cylc-doc/stable/html/glossary.html#term-flow) when applicable. Removed tasks (flow=None) are now dimmed.

### 🔧 Fixes

[#1979](https://github.com/cylc/cylc-ui/pull/1979) - Don't offer the n-window selection if you don't have permissions to use it.

## cylc-ui-2.6.0 (Released 2024-10-09)

### 🚀 Enhancements

[#1888](https://github.com/cylc/cylc-ui/pull/1888) - Increased the width of the Edit Runtime dialog.

## cylc-ui-2.5.0 (Released 2024-06-18)

### 🚀 Enhancements

[#1466](https://github.com/cylc/cylc-ui/pull/1466) - Added gantt view: a new view showing job durations over time.

[#1510](https://github.com/cylc/cylc-ui/pull/1510) - Analysis view: added a time series layout which plots run time against cycle points.

[#1717](https://github.com/cylc/cylc-ui/pull/1717), [#1744](https://github.com/cylc/cylc-ui/pull/1744), [#1745](https://github.com/cylc/cylc-ui/pull/1745), [#1751](https://github.com/cylc/cylc-ui/pull/1751) - More view options are now remembered & restored when navigating between workflows.

[#1755](https://github.com/cylc/cylc-ui/pull/1755) - Add a toolbar button for changing the graph window extent.

[#1763](https://github.com/cylc/cylc-ui/pull/1763) - Added graph view feature to group nodes by cycle point

### 🔧 Fixes

[#1758](https://github.com/cylc/cylc-ui/pull/1758) - Clicking "Log" in the command menu now works correctly for workflows in the sidebar.

[#1778](https://github.com/cylc/cylc-ui/pull/1778) - Compatibility with JupyterHub 4.1 XSRF changes

[#1780](https://github.com/cylc/cylc-ui/pull/1780) - Fixed graph view rendering bug in Firefox.

[#1802](https://github.com/cylc/cylc-ui/pull/1802) - Fixed bug where task progress animations would reset when switching between tabs in the workspace.

## cylc-ui-2.4.0 (Released 2024-04-02)

### Enhancements

[#1711](https://github.com/cylc/cylc-ui/pull/1711),
[#1705](https://github.com/cylc/cylc-ui/pull/1705),
[#1688](https://github.com/cylc/cylc-ui/pull/1688) -
Certain view options are now remembered & restored when navigating between workflows.

[#1664](https://github.com/cylc/cylc-ui/pull/1664) -
Workspace tab layout is now remembered & restored when navigating between workflows.

[#1708](https://github.com/cylc/cylc-ui/pull/1708) -
Usability improvements for the log view.

### Fixes

[#1623](https://github.com/cylc/cylc-ui/pull/1623),
[#1619](https://github.com/cylc/cylc-ui/pull/1619) -
Improve the efficiency of the tree view.

[#1636](https://github.com/cylc/cylc-ui/pull/1636),
[#1631](https://github.com/cylc/cylc-ui/pull/1631) -
Various other efficiency improvements.

[#1643](https://github.com/cylc/cylc-ui/pull/1643) -
Fix bug where the up/down/home/end keys would not work inside the Edit Runtime
form inputs.


## cylc-ui-2.3.0 (Released 2023-11-28)

### Fixes

[#1549](https://github.com/cylc/cylc-ui/pull/1549) -
Fix workflow filtering bug in the sidebar.


## cylc-ui-2.2.0 (Released 2023-11-02)

### Enhancements

[#1472](https://github.com/cylc/cylc-ui/pull/1472) -
Added refresh button to the sidebar.

[#1416](https://github.com/cylc/cylc-ui/pull/1416) -
Single-child directories in the sidebar are now flattened to reduce visual clutter.

### Fixes

[#1513](https://github.com/cylc/cylc-ui/pull/1513) -
Fix a couple of issues which could cause errors in the GUI.

[#1502](https://github.com/cylc/cylc-ui/pull/1502) -
Fixed bug where toggle buttons in view toolbars would not change state.

[#1434](https://github.com/cylc/cylc-ui/pull/1434) -
Small accessibility/appearance improvements.


## cylc-ui-2.1.0 (Released 2023-09-07)

### Enhancements

[#1355](https://github.com/cylc/cylc-ui/pull/1355) -
Analysis view: added a box & whiskers plot layout.

[#1444](https://github.com/cylc/cylc-ui/pull/1444) -
Select user and deployment functionalities for multi-user mode and added user avatar.

[#1428](https://github.com/cylc/cylc-ui/pull/1428) -
Pinned buttons to the bottom of the command edit form.

[#1437](https://github.com/cylc/cylc-ui/pull/1437) -
Add landing page for unauthorised users.


## cylc-ui-2.0.0 (Released 2023-07-21)

### Enhancements

[#1269](https://github.com/cylc/cylc-ui/pull/1269) -
Upgraded Vue and Vuetify frameworks to v3.

[#1240](https://github.com/cylc/cylc-ui/pull/1240) - Allow edit-runtime
for `[root]` family by clicking on Cycle icon.

[#1345](https://github.com/cylc/cylc-ui/pull/1345) -
Added setting to choose the default view for workflows (tree, table etc.).

[#1330](https://github.com/cylc/cylc-ui/pull/1330) -
Added setting to turn off most animations.

[#1114](https://github.com/cylc/cylc-ui/pull/1114) -
Tree view: show mean run time in job details.

### Fixes

[#1340](https://github.com/cylc/cylc-ui/pull/1340) -
Fixed bug in tree view where tasks belonging to families would disappear
and reappear eroneously.

[#1312](https://github.com/cylc/cylc-ui/pull/1312) -
Fixed incorrect latest job info in table view.

[#1336](https://github.com/cylc/cylc-ui/pull/1336) -
Fixed task state filtering bug in tree view.


## cylc-ui-1.6.0 (Released 2023-04-27)

### Enhancements

[#1275](https://github.com/cylc/cylc-ui/pull/1275) -
Various improvements to the log view including the ability to view prior
job submissions, workflow log files and the connection status of the
log file subscription.

[#1187](https://github.com/cylc/cylc-ui/pull/1187) - Improved the workflow
filtering menu in the sidebar.

[#1254](https://github.com/cylc/cylc-ui/pull/1254) - Add analysis view:
A new view that displays task timing statistics

### Fixes

[#1249](https://github.com/cylc/cylc-ui/pull/1249) - Fix tasks not loading
when navigating between workflows in the standalone `#/tree/` and `#/table/`
views.


## cylc-ui-1.5.0 (Released 2023-02-20)

### Enhancements

[#1184](https://github.com/cylc/cylc-ui/pull/1184) - Mean times for tasks
in table changed to human readable ISO duration format.

[#1182](https://github.com/cylc/cylc-ui/pull/1182) - Allow filtering by
cycle point and family in tree & table views.

### Fixes

[#1230](https://github.com/cylc/cylc-ui/pull/1230) -
Fixes an issue where tasks were missing from the GUI in workflows which
use multi-level family inheritance.

[#1182](https://github.com/cylc/cylc-ui/pull/1182) - Fixes bug in filtering
by task name.


## cylc-ui-1.4.0 (Released 2023-01-16)

### Enhancements

[#1158](https://github.com/cylc/cylc-ui/pull/1158) -
Add log view: A new view which displays workflow and job logs (similar
to log view available in Cylc 7 cylc review).

[#1108](https://github.com/cylc/cylc-ui/pull/1108) -
Add graph view: A new view which displays tasks and dependencies as a graph
(like the Cylc 7 graph view).

[#1144](https://github.com/cylc/cylc-ui/pull/1144) - Add "Edit Runtime"
command, a more convenient way to perform broadcasts by viewing and editing a
task/family's runtime configuration.

[#1108](https://github.com/cylc/cylc-ui/pull/1108) -
Tree view: Task messages are now shown along with outputs.

[#1124](https://github.com/cylc/cylc-ui/pull/1075) - Table view: More options
for number of tasks per page.

[#1177](https://github.com/cylc/cylc-ui/pull/1177) -
New tabs now open on top.

[#1178](https://github.com/cylc/cylc-ui/pull/1178) - Improve appearance of
Table view.

[#1043](https://github.com/cylc/cylc-ui/pull/1043) - The GScan sidebar is
now resizeable.

### Fixes

[#1164](https://github.com/cylc/cylc-ui/pull/1164) -
Fix the mean run time column in the table view.

[#1167](https://github.com/cylc/cylc-ui/pull/1168) - Prevent command menu from
jumping after a delay when clicking "see more".

[#1108](https://github.com/cylc/cylc-ui/pull/1108) -
Tree view: Task outputs are now correctly associated with the jobs that created
them.

[#1075](https://github.com/cylc/cylc-ui/pull/1075) - Reverse default sort order
of the table view so it matches the tree view.

[#1107](https://github.com/cylc/cylc-ui/pull/1107) - Use natural sort for table
view cycle point column.


## cylc-ui-1.3.0 (Released 2022-07-27)

### Enhancements

[#1073](https://github.com/cylc/cylc-ui/pull/1073) - Improve validation of the
command edit form.


## cylc-ui-1.2.1 (Released 2022-05-30)

### Fixes

[#1011](https://github.com/cylc/cylc-ui/pull/1011) - Fix bug where the
workflow commands menu would show the wrong workflow.


## cylc-ui-1.2.0 (Released 2022-05-19)

### Enhancements

[#967](https://github.com/cylc/cylc-ui/pull/967) - Appearance improvements.

[#1027](https://github.com/cylc/cylc-ui/pull/1027) - Remove development
"Mutations View".

### Fixes

[#979](https://github.com/cylc/cylc-ui/pull/979) - Fix bug where the commands
menu could sometimes break.


## cylc-ui-1.1.0 (Released 2022-03-23)

### Enhancements

[#928](https://github.com/cylc/cylc-ui/pull/928) - Enable accessing the workflow
commands menu from GScan (sidebar).


## cylc-ui-1.0.0 (Released 2022-02-17)

### Enhancements

[#672](https://github.com/cylc/cylc-ui/pull/672),
[#861](https://github.com/cylc/cylc-ui/pull/861) - Added the workflow table view.

[#861](https://github.com/cylc/cylc-ui/pull/861) - Instant task filtering in
the workflow tree and table views.

[#876](https://github.com/cylc/cylc-ui/pull/876) -
Convert to use the new Cylc "Universal Identifier".

[#873](https://github.com/cylc/cylc-ui/pull/873) - Header now displays hostname
rather than 'development'.

[#891](https://github.com/cylc/cylc-ui/pull/891) - Clicking on cycles, tasks
or jobs now shows the relevant ID and status.

[#839](https://github.com/cylc/cylc-ui/pull/839) - Appearance improvements.

### Fixes

[#927](https://github.com/cylc/cylc-ui/pull/927) - Fix bug where the commands
menu would disappear when clicking on another task/cycle point/etc.


## cylc-ui-0.6 (Released 2021-11-10)

### Enhancements

[#502](https://github.com/cylc/cylc-ui/pull/502) - Hierarchical GScan.

[#711](https://github.com/cylc/cylc-ui/pull/711) -
Support Jupyter Server conversion. (the CylcUIServer has been converted
to a Jupyter Server extension).

[#728](https://github.com/cylc/cylc-ui/pull/728) -
Display authorized commands in the User Profile and disable unauthorized
commands in the commands menu.

[#749](https://github.com/cylc/cylc-ui/pull/749)
& [#834](https://github.com/cylc/cylc-ui/issues/834)
- Miscellaneous improvements to the processing of delta updates.

[#731](https://github.com/cylc/cylc-ui/pull/731),
[#810](https://github.com/cylc/cylc-ui/pull/810) - Appearance improvements.

### Fixes

[#748](https://github.com/cylc/cylc-ui/issues/748)
& [#805](https://github.com/cylc/cylc-ui/pull/805)
& [#806](https://github.com/cylc/cylc-ui/pull/806)
- Fix issues with the workflow status and play/pause/stop buttons not
updating correctly & enable starting a workflow from stopped.


## cylc-ui-0.5 (Released 2021-07-28)

### Enhancements

[#656](https://github.com/cylc/cylc-ui/pull/656) - Show runahead-limited tasks.

[#657](https://github.com/cylc/cylc-ui/pull/657) - Display a different icon, with
a shadow underneath, for the Job component.

[#658](https://github.com/cylc/cylc-ui/pull/658) - Allow user to set the order
of cycle points.

[#543](https://github.com/cylc/cylc-ui/pull/543) - Use deltas in GScan.

[#234](https://github.com/cylc/cylc-ui/pull/234) - Use query variables
in GraphQL instead of string replace.

[#209](https://github.com/cylc/cylc-ui/pull/209) - WorkflowService doesn't
work with nodesEdges, edges, or any other top level entry.

[#160](https://github.com/cylc/cylc-ui/pull/160) - Reduce duplicated code
when using WorkflowService.

[#356](https://github.com/cylc/cylc-ui/pull/356) - Use graphql-tag instead
of Strings for GraphQL queries, fragments.

[#388](https://github.com/cylc/cylc-ui/pull/388) - Prevent unnecessary
subscription requests.

[#453](https://github.com/cylc/cylc-ui/pull/453) - Confirm we don't have
subscriptions outliving the views/use, to avoid performance issues, and
add unit/e2e tests.

[#661](https://github.com/cylc/cylc-ui/pull/661) - Avoid data duplication
in added deltas.

[#684](https://github.com/cylc/cylc-ui/pull/684) - Create a single object
to receive the deltas of workflow-subscriptions.

[#625](https://github.com/cylc/cylc-ui/pull/625) - alert: repeated errors
are ignored.

[#672](https://github.com/cylc/cylc-ui/pull/672) - add table view.

### Fixes

[#691](https://github.com/cylc/cylc-ui/pull/691) -
Fix bug that could cause commands to be run against the wrong workflow.

[#649](https://github.com/cylc/cylc-ui/pull/649) - Avoid re-sorting a
sorted array, instead adding a new element in its sorted index (respecting
locale, and numeric on).

[#676](https://github.com/cylc/cylc-ui/pull/676) - Fix the reactivity of the
cycle point icon state. After this, the Task icon used to summarize the cycle
point state should be updated to reflect the overall state based on the states
of its children nodes.

[#669](https://github.com/cylc/cylc-ui/pull/669) - Define the height
of each table row, and specify the Skeleton height to avoid content shift.

[#416](https://github.com/cylc/cylc-ui/pull/416) - WorkflowService/GQuery
fetches more data than what it needs when GScan + a view/component are used.

[#688](https://github.com/cylc/cylc-ui/pull/688) - gscan: installed workflows.

[#671](https://github.com/cylc/cylc-ui/pull/671) - UI shows loading state
forever if no workflows exist.


## cylc-ui-0.4 (Released 2021-04-16)

### Enhancements

[#641](https://github.com/cylc/cylc-ui/pull/641) -
Display the new "platform" for jobs rather than the legacy "host" value.

[#677](https://github.com/cylc/cylc-ui/pull/677) -
Create a urls module to simplify how we concatenate strings to create
URLs.


## cylc-ui-0.3 (Released 2021-03-25)

Release 0.3 of Cylc UI.

### Backward incompatible changes

None or N/A.

### Enhancements

[#636](https://github.com/cylc/cylc-ui/pull/636) -
Improve the appearance of commands menus and display an expandable short list
of commands.

[#616](https://github.com/cylc/cylc-ui/pull/616) - Alert the user if there are
any errors processing deltas.

[#623](https://github.com/cylc/cylc-ui/pull/623) - Display errors from
commands.

[#607](https://github.com/cylc/cylc-ui/pull/607) - Animate task progress
using average run times.

[#598](https://github.com/cylc/cylc-ui/pull/598) - Add workflow commands menu.

[#530](https://github.com/cylc/cylc-ui/pull/530) - Display message triggers.

[#544](https://github.com/cylc/cylc-ui/pull/544) - Enable editing
command inputs and support broadcasts in the UI.

[#574](https://github.com/cylc/cylc-ui/pull/574) - Add collapse all and expand
all buttons to Tree component.

[#577](https://github.com/cylc/cylc-ui/pull/577) - Improve how GScan behaves
in responsive mode (smaller viewports).

[#560](https://github.com/cylc/cylc-ui/pull/560) - Make job-details a node
in the tree, expand/collapse control, align tree-leaf-triangle. Also align
job icons vertically in the middle of the HTML element.

[#504](https://github.com/cylc/cylc-ui/pull/504) - Add commands menu to the tree
view to allow interacting with tasks, families and cycles.

[#499](https://github.com/cylc/cylc-ui/pull/499) - Add search and
filter functionalities to GScan.

[#503](https://github.com/cylc/cylc-ui/pull/503) - Add configurable
colour themes for Cylc job icons.

[#498](https://github.com/cylc/cylc-ui/pull/498) - Sort GScan workflows
by type (first running, then held, then stopped), and then by name.

[#493](https://github.com/cylc/cylc-ui/pull/493) - async updates to the
UI, adding support to stopped workflows.

[#497](https://github.com/cylc/cylc-ui/pull/497) - Add a global error
catcher to the Default layout, to show uncaught errors.

[#491](https://github.com/cylc/cylc-ui/pull/491) - Update apollo-client
to @apollo/client (different package ID, also from 2.x to 3.x).

[#492](https://github.com/cylc/cylc-ui/pull/492) - Sort tree view
by cyclepoints and task names.

[#458](https://github.com/cylc/cylc-ui/pull/458) - Add CylcTree and
use deltas for the Tree view and component.

[#481](https://github.com/cylc/cylc-ui/pull/481) - Update dependencies,
most important ones were Vue/React, Apollo GraphQL libraries, GraphQL,
and the development libraries.

[#483](https://github.com/cylc/cylc-ui/pull/458) - Filter tree item
by tasks name and tasks states.

[#505](https://github.com/cylc/cylc-ui/pull/505) - Use cycle point ID
in the tree view structure.

[#522](https://github.com/cylc/cylc-ui/pull/522) - Improve v-select of task state filter in responsive

### Fixes

[#584](https://github.com/cylc/cylc-ui/pull/584) - Avoid NaN task progress, showing correct progress & icon.

[#552](https://github.com/cylc/cylc-ui/pull/552) - Move to next route before adding a new tree widget.

[#554](https://github.com/cylc/cylc-ui/pull/554) - Fix icons in the Dashboard.

[#556](https://github.com/cylc/cylc-ui/issues/556) - UI sees old and new state
of a re-run flow.

[#700](https://github.com/cylc/cylc-ui/issues/700) - Use WorkflowState to control Tree view state,
ignoring the shutdown property. This fixes console messages like "Received a delta before
the workflow initial data burst".

### Documentation

None.

### Security issues

None.


## cylc-ui-0.2 (2020-07-14)

Release 0.2 of Cylc UI.

### Backward incompatible changes

None or N/A.

### Enhancements

[#266](https://github.com/cylc/cylc-ui/pull/266) - Color cylc logo.

[#257](https://github.com/cylc/cylc-ui/pull/257) - Display toolbar for
workflows only.

[#283](https://github.com/cylc/cylc-ui/pull/283) - Load user information
on application startup.

[#285](https://github.com/cylc/cylc-ui/pull/285) - Update Vuetify to 2.1,
along with other dependencies with updates available.

[#291](https://github.com/cylc/cylc-ui/pull/291) - Add families to Tree
view and component.

[#301](https://github.com/cylc/cylc-ui/pull/301) - Add GScan component.

[#327](https://github.com/cylc/cylc-ui/pull/327) - Use live data for the
dashboard workflows summary.

[#307](https://github.com/cylc/cylc-ui/pull/307) - Invoke mutations to
hold, release, and stop workflows.

[#280](https://github.com/cylc/cylc-ui/pull/280) - Add WebSockets client
for GraphQL subscriptions.

[#325](https://github.com/cylc/cylc-ui/pull/325) - Create Workflow
component with Lumino.

[#355](https://github.com/cylc/cylc-ui/pull/355) - Use wss when page
protocol is http:

[#379](https://github.com/cylc/cylc-ui/pull/379) - Add ConnectionStatus
component.

[#446](https://github.com/cylc/cylc-ui/pull/446) - Allow users to
increase, decrease, and reset UI font size.

[#457](https://github.com/cylc/cylc-ui/pull/457) - Add a GraphiQL
view using graphiql.js that sends queries to the backend graphiql
endpoint.

### Fixes

[#275](https://github.com/cylc/cylc-ui/pull/275) - Fix size of dashboard
links on hover.

[#254](https://github.com/cylc/cylc-ui/pull/254) -  Keep cache in sync,
and use a global event bus.

[#284](https://github.com/cylc/cylc-ui/pull/284) -  Use data from
JupyterHub to create the Hub URL (handling base_url).

[#297](https://github.com/cylc/cylc-ui/pull/297) - Support IE and Safari

[#306](https://github.com/cylc/cylc-ui/pull/306) - Dismissing alerts leave
a blank space in the page

[#341](https://github.com/cylc/cylc-ui/pull/341) - Fix toolbar (responsive
mode and drawer)

[#361](https://github.com/cylc/cylc-ui/pull/361) - Remove the unneeded footer
component

[#370](https://github.com/cylc/cylc-ui/pull/370) - Fix up the old gscan table
view and move access to the dashboard.

[#396](https://github.com/cylc/cylc-ui/pull/396) - Fix leaf and other tree
nodes layout.

[#432](https://github.com/cylc/cylc-ui/pull/432) - Add loading state to
Lumino widgets with skeleton loaders, preventing it from displaying the
data of other workflows for a brief moment.

### Documentation

[#215](https://github.com/cylc/cylc-ui/pull/215) - guide: add beginnings
of a user guide.

### Security issues

None.


## cylc-ui-0.1 (2019-09-18)

Initial release of Cylc UI.
