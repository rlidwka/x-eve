require('./helper')

describe('type', function() {
  describe('string', function() {
    var type = eve.type

    it('should have string type', function() {
      ok(type.string)
    })

    var schema = type.string().lowercase().trim().notEmpty().len(3,12)
							.match(/^[a-zA-Z0-9]*$/)
							.validator(function(val, done) {
						      setTimeout(function() {
						        done(val != 'admin')
						      }, 100)
						   })

    it('should trim and lowercase', function() {
      equal(schema.val(' Test ').val(), 'test')
    })

    it('should have length in 3~12', function() {
      ok(schema.val('dd').validate())
      ok(type.string().len(3).val('dd').validate())
      ok(!schema.val('test').validate())
    })

    it('should be a valid match', function() {
      ok(schema.val('test-').validate())
    })

    it('should be unique', function(done) {
      schema.val('admin').validate(function(err) {
        ok(err && err.messages())
        done()
      })
    })

    it('should be an email address', function(done) {
      type.string().email().val('dd').validate(function(err) {
        ok(err && err.messages())
      })

      type.string().email().val('sdf@wer.com').validate(function(err) {
        ok(!err)
      })

      type.string().email('be an email').val('dd').validate(function(err) {
        ok(err)
        equal(err.messages().length, 1)
        equal(err.messages(true)[0], 'be an email')
        done()
      })

      ok(type.string().email()._email)
    })

    it('should handle "required" separate from "notEmpty"', function() {
      type.string().notEmpty().val(null).validate(function(err) {
        ok(!err)
      })

      type.string().notEmpty().val("").validate(function(err) {
        ok(err)
      })
    })

    it('should be a url', function() {
      type.string().url().val('http').validate(function(err) {
        ok(err && err.messages())
      })

      type.string().url().val('http://google.com').validate(function(err) {
        ok(!err)
      })

      ok(type.string().url()._url)
    })

    it('should be a string', function() {
      var err = type.string().val(new Date()).validate()
      ok(err && err.messages())

      var err = type.string().val([]).validate()
      ok(err && err.messages())
      
      var err = type.string().val({}).validate()
      ok(err && err.messages())
    })

    it('should convert numbers', function() {
      var err = type.string().val(4).validate()
      ok(!err)

      var err = type.string().val(4.5).validate()
      ok(!err)
	 })

    it('should support enum validate', function() {
      ok(!type.string().enum(['male', 'female']).val('male').validate())
      ok(type.string().enum(['male', 'female']).val('other').validate())

      var sc = type.string().enum([ 'a', 'b' ])
      equal('a', sc._enum[0])
      equal('b', sc._enum[1])
    })
  })
})
