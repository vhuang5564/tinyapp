const bcrypt = require('bcryptjs');

const plaintextPassword = 'hello';

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(plaintextPassword, salt, (err, hash) => {
    console.log(hash);
  });
});

const hashedPassword = '$2a$10$saoP5b.GNQVG8O0NP2jjQuj0lJQt6hORebTUVJlDxrGQNyM3qWGPe'
const testPassword = 'apple'

bcrypt.compare(testPassword, hashedPassword, (err, result) => {
  console.log(result);
})