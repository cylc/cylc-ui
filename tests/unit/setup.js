/**
 * Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.
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

import { vi } from 'vitest'

// ECharts renders onto a <canvas>, which is not supported by the happy-dom
// test environment (it provides no 2D rendering context). Mock the core module
// so that components which embed charts (e.g. TimeSeries, GanttChart, BoxPlot)
// can be mounted and tested without triggering canvas rendering errors.
vi.mock('echarts/core', () => {
  const createChartStub = () => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    clear: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    dispatchAction: vi.fn(),
    getZr: vi.fn(() => ({ on: vi.fn(), off: vi.fn() })),
  })
  return {
    use: vi.fn(),
    init: vi.fn(() => createChartStub()),
  }
})

