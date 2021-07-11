const findUserByEmail = (email, users) => {
  for (const id in users) {
    const user = users[id]
    if(user.email === email) {
      return user;
    } 
  }
  return null;
}

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8)
}

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

console.log(findUserByEmail(('user@example.com'), users))


module.exports =  { findUserByEmail, generateRandomString }


