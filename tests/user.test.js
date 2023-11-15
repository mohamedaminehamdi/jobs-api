const jwt = require('jsonwebtoken');
const User = require('../models/User');

describe('User model', () => {
  it('falls back to a one day token when JWT_LIFETIME is not set', async () => {
    const lifetime = process.env.JWT_LIFETIME;
    delete process.env.JWT_LIFETIME;
    const user = await User.create({ name: 'Jane', email: 'jane@example.com', password: 'secret' });
    const { iat, exp } = jwt.decode(user.createJWT());
    process.env.JWT_LIFETIME = lifetime;
    expect(exp - iat).toBe(24 * 60 * 60);
  });

  it('never serializes the password', async () => {
    const user = await User.create({ name: 'Jane', email: 'jane@example.com', password: 'secret' });
    expect(user.toJSON()).not.toHaveProperty('password');
    expect(JSON.parse(JSON.stringify(user))).not.toHaveProperty('password');
  });

  it('stores a hash and keeps it when other fields change', async () => {
    const user = await User.create({ name: 'Jane', email: 'jane@example.com', password: 'secret' });
    const hash = user.password;
    expect(hash).not.toBe('secret');
    user.name = 'Janet';
    await user.save();
    expect(user.password).toBe(hash);
    expect(await user.matchPasswords('secret')).toBe(true);
  });
});
