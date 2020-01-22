import FormInput from '@/components/graphqlFormGenerator/FormInput'

export const formElement = {
  components: {
    'form-input': FormInput
  },

  props: {
    // the GraphQL type this input represents
    gqlType: {
      type: Object,
      required: true
    },
    // array of all GraphQL types in the schema
    types: {
      type: Array,
      default: () => []
    },
    // the form label for this input
    label: {
      type: String,
      required: true
    },
    // the value (v-model is actually syntactic sugar for this)
    value: {
      required: true
    }
  },

  data: () => ({
    FormInput: FormInput
  }),

  computed: {
    /* The model we pass to the form input.
     *
     * Note the v-model approach does not work with nesting out of the box,
     * you need to capture and propagate "input" events up the component tree
     * to enable this nested structure of components to share the same model
     * and be managed by Vue correctly.
     */
    model: {
      get () {
        return this.value
      },

      set (val) {
        this.$emit('input', val)
      }
    },

    type () {
      for (const type of this.types) {
        if (type.name === this.gqlType.name && type.kind === this.gqlType.kind) {
          return type
        }
      }
      return null
    }
  }
}

export const formModel = {
  methods: {
    /* Return a null value of a JS type corresponding to the GraphQL type. */
    getNullValue (type) {
      let ret = null
      let pointer = type
      while (pointer) {
        if (pointer.kind === 'LIST') {
          ret = [
            this.getNullValue(pointer.ofType)
          ]
          break
        }
        if (pointer.kind === 'INPUT_OBJECT') {
          ret = {}
          console.log(pointer)
          for (const type of this.types) {
            // TODO: this type iteration is already done in the mixin
            //       should we use the mixin or a subset there-of here?
            if (
              type.name === pointer.name &&
              type.kind === pointer.kind
            ) {
              for (const field of type.inputFields) {
                ret[field.name] = this.getNullValue(field.type)
              }
              break
            }
          }
          break
        }
        pointer = pointer.ofType
      }
      return ret
    }
  }
}
