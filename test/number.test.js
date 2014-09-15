require('./helper.js')

describe('type', function() {
  var type = eve.type

  describe('number', function() {
    it('should have number type', function() {
      ok(type.number)
    })

    it('should convert type', function() {
      strictEqual(type.number().val('23dd').val(), '23dd')
      strictEqual(type.number().val('23.11').val(), 23.11)
      strictEqual(type.number().val(23.11).val(), 23.11)
    })

    it('should be able to compare', function() {
      ok(!type.number().min(10).max(30).val(23.11).validate())
      ok(type.number().min(10).max(30).val(9).validate())
      ok(type.number().min(10).max(30).val(40).validate())
    })

    it('should not accept empty numbers', function() {
      ok(type.number().notEmpty().val(0).validate())
      ok(type.number().notEmpty().val(0.0).validate())
      ok(!type.number().notEmpty().val(1).validate())
    })
  })

  describe('integer', function() {
    it('should have integer type', function() {
      ok(type.integer)
    })

    it('should convert type', function() {
      strictEqual(type.integer().val('23dd').val(), '23dd')
      strictEqual(type.integer().val('23.11').val(), '23.11')
      strictEqual(type.integer().val('23').val(), 23)
      strictEqual(type.integer().val(23.11).val(), 23.11)
      strictEqual(type.integer().val('sfd').val(), 'sfd')
      strictEqual(type.integer().val(null).val(), null)
      strictEqual(type.integer().val(0).val(), 0)
    })

    it('should support enum validate', function() {
      ok(!type.integer().enum([1, 2, 3]).val(1).validate())
      ok(type.integer().enum([1, 2, 3]).val(0).validate())

      var sc = type.integer().enum([2, 4])
      equal(2, sc._enum[0])
      equal(4, sc._enum[1])
    })
  })
})

