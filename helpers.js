const findUserByEmail = (email, users) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

module.exports =  { findUserByEmail, generateRandomString };


