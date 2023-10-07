const User = require('../models/User');

describe('User model', () => {
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
