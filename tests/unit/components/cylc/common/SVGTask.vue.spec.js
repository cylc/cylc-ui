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

import SVGTask from '@/components/cylc/SVGTask.vue'
import { mount } from '@vue/test-utils'

describe('modifier', () => {
  it.each([
    // isHeld takes priority over everything else:
    [['isHeld'], 'held'],
    [['isQueued', 'isHeld'], 'held'],
    [['isHeld', 'isRunahead'], 'held'],
    [['isHeld', 'isRetry'], 'held'],
    [['isHeld', 'isWallclock'], 'held'],
    [['isHeld', 'isQueued'], 'held'],
    [['isHeld', 'isXtriggered', 'isRunahead', 'isRetry', 'isQueued', 'isWallclock'], 'held'],
    // isXtriggered is bottom of the list:
    [['isXtriggered'], 'xtriggered'],
    [['isRunahead', 'isXtriggered'], 'runahead'],
    [['isRetry', 'isXtriggered'], 'retry'],
    [['isWallclock', 'isXtriggered'], 'wallclock'],
    [['isHeld', 'isWallclock', 'isXtriggered'], 'held'],
    // Some cases in the middle of the list:
    [['isQueued', 'isRunahead', 'isXtriggered'], 'runahead'],
    [['isRunahead', 'isRetry', 'isWallclock'], 'runahead'],
    // Skip is handled before queued and after runahead
    [['isRunahead', 'skip'], 'runahead'],
    [['isQueued', 'skip'], 'skip'],
  ])('returns the correct modifier for %o', (switchedOn, expected) => {
    const wrapper = mount(SVGTask, {
      props: {
        task: Object.fromEntries(
          // switchedOn.map((modifier) => [modifier, true])
          switchedOn.map(mapper)
        ),
      },
    })
    function mapper (key) {
      if (key === 'skip') {
        return ['runtime', { runMode: 'Skip' }]
      } else {
        return [key, true]
      }
    }
    expect(wrapper.vm.modifier).toBe(expected)
    expect(wrapper.get('.c8-task').classes()).toContain(expected)
  })
})
