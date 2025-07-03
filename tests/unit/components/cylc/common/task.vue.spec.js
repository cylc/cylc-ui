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

describe('modfier', () => {
  it('should return the correct modifier for a task', () => {
    for (const [switchedOn, expected] of [
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
      [['isQueued', 'isRunahead', 'isXtriggered'], 'queued'],
      [['isRunahead', 'isRetry', 'isWallclock'], 'runahead'],
    ]) {
      const modifiers = {
        isQueued: switchedOn.includes('isQueued'),
        isHeld: switchedOn.includes('isHeld'),
        isRunahead: switchedOn.includes('isRunahead'),
        isRetry: switchedOn.includes('isRetry'),
        isWallclock: switchedOn.includes('isWallclock'),
        isXtriggered: switchedOn.includes('isXtriggered'),
      }
      const wrapper = mount(SVGTask, {
        props: {
          task: modifiers,
        }
      })
      expect(
        wrapper
          .get('.c8-task')
          .classes()[1]
      )
        .to.equal(expected)
    }
  })
})
