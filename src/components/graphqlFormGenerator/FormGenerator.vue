<template>
  <div class='graphql-form-generator' ref='container'>
    <h3>{{ mutation.name }}</h3>
    <p>{{ mutation.description }}</p>
  </div>
</template>

<script>
import { VTextField } from 'vuetify/lib/components/VTextField'
import { VForm } from 'vuetify/lib/components/VForm'

const FORM_COMPONENTS = {
  Form: {
    component: VForm,
    model: 'v-model'
  }
}

const TYPE_COMPONENTS = {
  String: {
    component: VTextField,
    model: 'v-model',
    label: 'label'
  }
}

const KIND_COMPONENTS = {
}

export default {
  components: {
  },

  props: {
    mutation: {
      type: Object,
      required: true
    }
  },

  data: () => ({
    model: {}
  }),

  mounted () {
    // create form
    const Form = FORM_COMPONENTS.Form
    const propsData = {}
    propsData[Form] = {}
    propsData['ref'] = 'form'
    const form = new Form.component({
      propsData
    })
    form.$mount()
    this.$refs.container.appendChild(form.$el)

    // create arguments
    for (let argument of this.mutation.args) {
      form.$el.append(
        this.createArgumentComponent(argument).$el
      )
    }
  },

  methods: {
    derive (argument) {
      // const type = argument.type.name
      // const kind = argument.type.kind

      // TODO: hardcoded for now
      const type = 'String'
      const kind = null

      if (TYPE_COMPONENTS[type]) {
        return [type, TYPE_COMPONENTS[type]]
      }
      if (KIND_COMPONENTS[kind]) {
        return [kind, KIND_COMPONENTS[kind]]
      }
      return null
    },

    createArgumentComponent (argument) {
      const [name, options] = this.derive(argument)
      const propsData = {}
      propsData[options.label] = argument.name
      propsData[options.model] = {}
      const instance = new options.component({
        propsData
      })
      // instance.$slots.default = []
      instance.$mount()
      //this.$refs.container.appendChild(instance.$el)
      return instance
    }
  }
}
</script>
