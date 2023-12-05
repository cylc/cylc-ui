/**
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

import { Alert } from '@/model/Alert.model'

describe('Alert model', () => {
  describe('constructor', () => {
    it('should be created', () => {
      const err = 'my error'
      const color = 'success'
      let alert = new Alert(err, color)
      expect(alert.err).to.equal(err)
      expect(alert.color).to.equal(color)
      expect(alert.text).to.equal(err)
      const msg = 'a custom messsage'
      alert = new Alert(err, color, msg)
      expect(alert.text).to.equal(msg)
    })
  })
})
