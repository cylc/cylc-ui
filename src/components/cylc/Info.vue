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

<template>
  <div class="c-info">
    <!-- The task summary

    * The "-40" comes from the GraphNode offset, see the GraphNode compoent.
    * The height is "200" + "40".
    * The "99999" is the maximum component width (because we don't know
      how wide it will be until we render it).
    * The "overflow-x: hidden" prevents this 99999 width from causing
      horizontal scrolling.
    * The "8em" is the height that this SVG will be scaled to fill.
    -->
    <div style="overflow-x: hidden;">
      <svg
        preserveAspectRatio="xMinYMin"
        viewBox="-40 -40 99999 200"
        height="6em"
      >
        <GraphNode
          :task="task"
          :jobs="task.children"
          :jobTheme="jobTheme"
        />
      </svg>
    </div>

    <!-- The task information -->
    <v-expansion-panels
      multiple
      variant="accordion"
      v-model="panelExpansionModel"
    >
      <!-- The metadata -->
      <v-expansion-panel class="metadata-panel">
        <v-expansion-panel-title color="blue-grey-lighten-1">
          Metadata
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <dl>
            <dt>Title</dt>
            <dd>{{ taskMetadata.title }}</dd>
            <v-divider />
            <dt>Description</dt>
            <dd><span class="markup">{{ taskMetadata.description }}</span></dd>
            <v-divider />
            <dt>URL</dt>
            <dd>
              <!--
                  NOTE: for security reasons, always display the full URL
                  that the link directs to
              -->
              <a
                v-if="taskMetadata.URL"
                :href="taskMetadata.URL"
                target="_blank"
              >
                {{ taskMetadata.URL }}
              </a>
            </dd>
            <v-divider />
            <template v-for="(value, key) in customMetadata" :key="key">
              <dt>{{ key }}</dt>
              <dd><span class="markup">{{ value }}</span></dd>
              <v-divider />
            </template>
          </dl>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- The prereqs -->
      <v-expansion-panel class="prerequisites-panel">
        <v-expansion-panel-title color="blue-grey-lighten-2">
          Prerequisites
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <ul>
            <li v-for="prereq in prerequisites" :key="prereq.expression">
              <span
                class="prerequisite-alias condition"
                :class="{satisfied: prereq.satisfied}"
              >{{ prereq.expression.replace(/c/g, '') }}</span>
              <ul>
                <li
                  v-for="condition in prereq.conditions"
                  :key="condition.taskAlias"
                >
                  <span
                    class="prerequisite-alias condition"
                    :class="{satisfied: condition.satisfied}"
                  >
                    {{ condition.exprAlias.replace(/c/, '') }}
                  </span>
                  <span style="margin-left: 0.5em">
                    {{ condition.taskId }}:{{ condition.reqState }}
                  </span>
                </li>
              </ul>
            </li>
          </ul>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- The outputs -->
      <v-expansion-panel class="outputs-panel">
        <v-expansion-panel-title color="blue-grey-lighten-1">
          Outputs
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <ul>
            <li v-for="output in outputs" :key="output.label">
              <span
                class="condition"
                :class="{satisfied: output.satisfied}"
              >{{ output.label }}</span>
            </li>
          </ul>
        </v-expansion-panel-text>
      </v-expansion-panel>

    </v-expansion-panels>
  </div>
</template>

<script>
import { useJobTheme } from '@/composables/localStorage'
import GraphNode from '@/components/cylc/GraphNode.vue'

export default {
  name: 'InfoComponent',

  components: {
    GraphNode,
  },

  props: {
    task: {
      required: true,
    },
    panelExpansion: {
      required: false,
      default: [0],
    },
  },

  setup (props, { emit }) {
    return {
      jobTheme: useJobTheme(),
    }
  },

  computed: {
    panelExpansionModel: {
      get () {
        return this.panelExpansion
      },
      set (value) {
        this.$emit('update:panelExpansion', value)
      },
    },

    taskMetadata () {
      // Default task metadata sections (title, description, URL)
      return this.task?.node?.task?.meta || {}
    },

    customMetadata () {
      // Used-defined task metadata sections
      return this.task?.node?.task?.meta.userDefined || {}
    },

    prerequisites () {
      // Task prerequsite information.
      return this.task?.node?.prerequisites || {}
    },

    outputs () {
      // Task output information.
      return this.task?.node?.outputs || {}
    },

  },

}
</script>

<style scoped lang="scss">
  .c-info {
    padding: 0.5em;

    // for user-defined text where whitespace should be preserved
    .markup {
      white-space: pre;
    }

    // prefixes a tick or cross before the entry
    .condition:before {
      content: '✕';
      padding-right: 0.5em;
      color: rgb(255, 100, 100);
    }
    .condition.satisfied:before {
      content: '✓';
      color: rgb(75, 230, 75);
    }

    // for prerequsite task "aliases" (used in conditional expressions)
    .prerequisite-alias {
      font-style: italic;
      color: rgb(100, 100, 255);
    }

    .metadata-panel {
      dl {
        dt dd {
          padding-left: 1em;
          padding-right: 1em;
        }
        dt {
          font-size: 1.3em;
          padding-top: 0.4em;
        }
        dd {
          padding-bottom: 0.4em;
        }
      }
    }

    .prerequisites-panel {
      li {
        list-style: none;
      }

      ul li ul {
        margin-left: 2em;
      }
    }

    .outputs-panel {
      li {
        list-style: none;
      }
    }
  }
</style>
