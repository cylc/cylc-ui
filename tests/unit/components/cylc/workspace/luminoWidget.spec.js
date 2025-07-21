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

import { LuminoWidget } from '@/components/cylc/workspace/luminoWidget'

describe('LuminoWidget', () => {
  it('stringifies to JSON and revives to new instance', () => {
    const layout = {
      widgets: [new LuminoWidget('widget71', 'Treadstone')]
    }
    const stringified = JSON.stringify(layout)
    expect(JSON.parse(stringified).widgets[0]).toEqual({
      id: 'widget71',
      name: 'Treadstone',
      closable: true,
    })
    const revived = JSON.parse(stringified, LuminoWidget.layoutReviver).widgets[0]
    expect(revived).toBeInstanceOf(LuminoWidget)
    expect(revived.id).toEqual('widget71')
    expect(revived.name).toEqual('Treadstone')
  })
})
