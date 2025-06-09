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
  Job - The job status icon implemented as an inline-block level object
        which can sit in text.
-->
<script>
import { h } from 'vue'
import { isEmpty } from 'lodash'

const Job = (props, context) => {
  // the job status icon
  //   * let width = 100 - x - stroke-width
  //   * let height = 100 - y - stroke-width
  const DEFAULT_SIZE = '80'
  const PREVIOUS_STATE_ITEMS_SIZE = '65'
  const DEFAULT_XY = '10'
  const PREVIOUS_STATE_ITEMS_XY = '25'
  const width = !isEmpty(props.previousState) ? PREVIOUS_STATE_ITEMS_SIZE : DEFAULT_SIZE
  const cJobClass = ['c-job', props.status]
  const jobStatusIcon = h(
    'rect',
    {
      class: props.status,
      x: DEFAULT_XY,
      y: DEFAULT_XY,
      width,
      height: width,
      rx: '15',
      ry: '15',
      'stroke-width': '10'
    }
  )
  // the job icon SVG
  //   * comments prefixed `let` are instructions for changing style
  //   * contain in a 100x100 viewBox so pixels and percent are equal
  //   * bind the job status here, respond to styling in the CSS
  const jobIconChildren = [jobStatusIcon]
  if (props.previousState) {
    const previousStateIconSvg = h(
      'rect',
      {
        class: `${props.previousState}`,
        x: PREVIOUS_STATE_ITEMS_XY,
        y: PREVIOUS_STATE_ITEMS_XY,
        width,
        height: width,
        rx: '15',
        ry: '15',
        opacity: '50%',
        'stroke-width': '10'
      }
    )
    jobIconChildren.splice(0, 0, previousStateIconSvg)
  }
  if (props.svg) {
    return h(
      'g',
      { class: cJobClass },
      [
        h('g', { class: 'job' }, jobIconChildren)
      ]
    )
  }
  const jobIconSvg = h(
    'svg',
    {
      class: 'job',
      viewBox: '0 0 100 100'
    },
    jobIconChildren
  )
  return h(
    'span',
    { class: cJobClass },
    [jobIconSvg]
  )
}

Job.props = {
  status: {
    type: String,
    required: true,
  },
  previousState: {
    type: String,
    required: false
  },
  svg: {
    type: Boolean,
    required: false,
    default: false
  }
}

export default Job
</script>
