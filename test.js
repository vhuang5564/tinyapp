email = 'user@example.com'

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
}

const findUserByEmail = email => {
  for (const id in users) {
    const user = users[id]
    if(user.email === email) {
      return user;
    } 
  }
}

console.log(findUserByEmail('user@example.com'))