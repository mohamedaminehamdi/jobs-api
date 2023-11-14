const errorHandler = require('../middleware/error-handler');
const { NotFoundError } = require('../errors');

const handle = (err) => {
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  errorHandler(err, {}, res, () => {});
  return res;
};

describe('error handler', () => {
  it('uses the status code of custom errors', () => {
    const res = handle(new NotFoundError('No job with id : 1'));
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ msg: 'No job with id : 1' });
  });

  it('joins mongoose validation messages', () => {
    const err = Object.assign(new Error(), {
      name: 'ValidationError',
      errors: { a: { message: 'first' }, b: { message: 'second' } },
    });
    expect(handle(err).body).toEqual({ msg: 'first,second' });
  });

  it('turns duplicate keys into a 400', () => {
    const err = Object.assign(new Error(), { code: 11000, keyValue: { email: 'a@b.co' } });
    const res = handle(err);
    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/Duplicate Value Entered for email field/);
  });

  it('turns cast errors into a 400', () => {
    const err = Object.assign(new Error(), { name: 'CastError', value: 'abc' });
    expect(handle(err).statusCode).toBe(400);
  });

  describe('unexpected errors', () => {
    const env = process.env.NODE_ENV;
    beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
    afterEach(() => {
      process.env.NODE_ENV = env;
      jest.restoreAllMocks();
    });

    it('returns 500 and logs the error', () => {
      const res = handle(new Error('db exploded'));
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ msg: 'db exploded' });
      expect(console.error).toHaveBeenCalled();
    });

    it('hides the message in production', () => {
      process.env.NODE_ENV = 'production';
      const res = handle(new Error('db exploded'));
      expect(res.body.msg).not.toMatch(/db exploded/);
    });
  });
});
