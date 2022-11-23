<!--
Copyright (C) NIWA & British Crown (Met Office) & Contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<!--
  Task - The task status icon implemented as an inline-block level object
         which can sit in text.
-->

<template>
  <span class="c-task">
    <svg viewBox="0 0 100 100" class="task">
      <SVGTask
        :task="task"
        :startTime="startTime"
        :modifierSize="modifierSize"
      />
    </svg>
  </span>
</template>

<script>
import SVGTask from '@/components/cylc/SVGTask'

export default {
  name: 'Task',
  props: {
    task: {
      required: true
    },
    startTime: {
      // TODO: aim to remove this in due course
      // (we should be able to obtain this directly from the task)
      required: false
    },
    modifierSize: {
      // Scale the size of the task state modifier
      type: Number,
      default: 0.7
    }
  },
  components: {
    SVGTask
  }
}
</script>

<style lang="scss">
  .c-task {
    .task {
      /* scale the icon to the font-size */
      width: 1em;
      height: 1em;
      overflow: visible;
      vertical-align: middle;
    }
  }
</style>
