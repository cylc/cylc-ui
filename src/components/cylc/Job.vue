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
import isEmpty from 'lodash/isEmpty'

export default {
  name: 'Job',
  functional: true,
  props: {
    status: {
      type: String,
      required: true,
    },
    previousState: {
      type: String,
      required: false,
    },
    svg: {
      type: Boolean,
      require: false,
      default: false,
    },
  },
  render: function (createElement, context) {
    // the job status icon
    //   * let width = 100 - x - stroke-width
    //   * let height = 100 - y - stroke-width
    const DEFAULT_SIZE = '80'
    const PREVIOUS_STATE_ITEMS_SIZE = '65'
    const DEFAULT_XY = '10'
    const PREVIOUS_STATE_ITEMS_XY = '25'
    const width = !isEmpty(context.props.previousState)
      ? PREVIOUS_STATE_ITEMS_SIZE
      : DEFAULT_SIZE
    const height = !isEmpty(context.props.previousState)
      ? PREVIOUS_STATE_ITEMS_SIZE
      : DEFAULT_SIZE
    const jobStatusIcon = createElement('rect', {
      attrs: {
        class: context.props.status,
        x: DEFAULT_XY,
        y: DEFAULT_XY,
        width,
        height,
        rx: '15',
        ry: '15',
        'stroke-width': '10',
      },
    })
    // the job icon SVG
    //   * comments prefixed `let` are instructions for changing style
    //   * contain in a 100x100 viewBox so pixels and percent are equal
    //   * bind the job status here, respond to styling in the CSS
    const jobIconChildren = [jobStatusIcon]
    if (context.props.previousState) {
      const previousStateIconSvg = createElement('rect', {
        attrs: {
          class: `${context.props.previousState}`,
          x: PREVIOUS_STATE_ITEMS_XY,
          y: PREVIOUS_STATE_ITEMS_XY,
          width,
          height,
          rx: '15',
          ry: '15',
          opacity: '50%',
          'stroke-width': '10',
        },
      })
      jobIconChildren.splice(0, 0, previousStateIconSvg)
    }
    if (context.props.svg) {
      return createElement('g', { class: 'c-job' }, [
        createElement('g', { class: 'job' }, jobIconChildren),
      ])
    }
    const jobIconSvg = createElement(
      'svg',
      {
        attrs: {
          class: 'job',
          viewBox: '0 0 100 100',
        },
      },
      jobIconChildren
    )
    // NOTE: context.data MUST be passed to ensure directives are
    //       passed down to the functional components
    //       https://github.com/vuejs/vue-loader/issues/1433
    const attrs = Object.assign(context.data, {
      attrs: {
        class: 'c-job',
        style: 'display:inline-block; vertical-align:middle',
      },
    })
    return createElement('span', attrs, [jobIconSvg])
  },
}
</script>
