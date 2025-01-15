/*
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { mount } from '@vue/test-utils'
import FlowNumsChip from '@/components/cylc/common/FlowNumsChip.vue'

describe('Flow Nums Chip component', () => {
  describe('showFlowNums', () => {
    it.each([
      [undefined, undefined],
      ['[]', false],
      ['[1]', false],
      ['[2]', true],
      ['[1, 2]', true],
    ])('%s -> %s', (flowNums, expected) => {
      const wrapper = mount(FlowNumsChip, {
        props: { flowNums },
        shallow: true,
      })
      expect(wrapper.vm.showFlowNums).toEqual(expected)
    })
  })
})
