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
  <div class="c-header d-flex flex-column align-center pt-3 pb-5">
    <div class="mb-2 px-6">
      <img src="/img/logo.svg" style="max-width: 100%; width: 300px"/>
    </div>
    <div
      id="cylc-select-options"
      class="c-environment-info w-100 d-flex flex-column align-center px-4 row-gap-3"
    >
      <v-defaults-provider :defaults="{
        VCombobox: {
          bgColor: 'white',
          rules: [(val) => Boolean(val) || 'Required'],
        },
      }">
        <!-- Owner combobox -->
        <v-combobox
          class="w-100"
          id="cylc-owner-combobox"
          :disabled="store.state.user.user.mode !== 'multi user'"
          label="server owner"
          :default="owner"
          :items="Array.from(owners)"
          v-model="owner"
          @keyup.enter="owners.add(owner)"
        >
          <template v-slot:item="{ item, props }">
            <!-- HTML that describe how select should render items when the select is open -->
            <v-list-item
              :title="item.title"
              v-bind="props"
            >
              <template v-slot:append v-if="item.title !== ownerOnLoad">
                <v-icon
                  @click.stop="owners.delete(item.title)"
                  color="pink-accent-4"
                  :icon="mdiClose"
                />
              </template>
            </v-list-item>
          </template>
        </v-combobox>
        <!-- Deployment combobox -->
        <v-combobox
          class="w-100"
          id="cylc-deployment-combobox"
          :disabled="store.state.user.user.mode !== 'multi user'"
          label="deployment"
          :default="deployment"
          :items="Array.from(deployments)"
          v-model="deployment"
          @keyup.enter="deployments.add(deployment)"
        >
          <template v-slot:item="{ item, props }">
            <!-- HTML that describe how select should render items when the select is open -->
            <v-list-item
              :title="item.title"
              v-bind="props"
            >
              <template v-slot:append v-if="item.title !== deploymentOnLoad">
                <v-icon
                  @click.stop="deployments.delete(item.title)"
                  color="pink-accent-4"
                  :icon="mdiClose"
                />
              </template>
            </v-list-item>
          </template>
        </v-combobox>
        <v-btn
          v-if="showGoButton"
          data-cy="multiuser-go-btn"
          :href="url"
          variant="flat"
          class="px-8"
          color="green"
          @click="owners.add(owner); deployments.add(deployment);"
        >
          Go
        </v-btn>
      </v-defaults-provider>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useLocalStorage } from '@vueuse/core'
import {
  mdiClose,
} from '@mdi/js'

const store = useStore()

const ownerOnLoad = store.state.user.user.owner
const owner = ref(ownerOnLoad)
const owners = useLocalStorage('owners', new Set([ownerOnLoad]))

const deploymentOnLoad = window.location.host
const deployment = ref(deploymentOnLoad)
const deployments = useLocalStorage('deployments', new Set([deploymentOnLoad]))

const url = computed(() => `//${deployment.value}/user/${owner.value}/cylc/#`)

const isNewRoute = computed(() => {
  return deployment.value !== deploymentOnLoad || owner.value !== ownerOnLoad
})

const showGoButton = computed(() => (
  store.state.user.user.mode !== 'single user' &&
  owner.value &&
  deployment.value &&
  isNewRoute.value
))

</script>
