const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {

  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", users);
    const expectedOutput = users.userRandomID;
    assert.equal(user, expectedOutput);
  });

  it('should return null with an invalid email', function() {
    const user = findUserByEmail("a.com", users);
    const expectedOutput = null;
    assert.equal(user, expectedOutput);
  });

});