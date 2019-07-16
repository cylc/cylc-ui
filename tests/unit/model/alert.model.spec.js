import { expect } from 'chai'
import Alert from '@/model/Alert.model.js'

describe('AlertModel', () => {
  describe('constructor', () => {
    it('should be created', () => {
      const text = 'my error'
      const icon = 'mdi-error'
      const color = 'success'
      const alert = new Alert(text, icon, color)
      expect(alert.getText()).to.equal('my error')
      expect(alert.getIcon()).to.equal('mdi-error')
      expect(alert.getColor()).to.equal('success')
    })
  })
})
