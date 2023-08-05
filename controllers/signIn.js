const handleSignIn = (request, response, database, bcrypt) => {
  const { email, password } = request.body;

  if (!email || !password) return response.status(400).json('Invalid form submission');

  database.select('hash', 'email')
    .from('login')
    .where('email', '=', email)
    .then((data) => {
      // Check to make sure that the password matches the hash
      const isValid = bcrypt.compareSync(password, data[0].hash);

      if (isValid) {
        return database.select('*')
          .from('users')
          .where('email', '=', email)
          .then((user) => response.json(user[0]))
          .catch(() => response.status(400).json('Unable to get user'))
      } else {
        response.status(400).json('Wrong credentials');
      }
    })
    .catch(() => response.status(400).json('Wrong credentials'));
}

module.exports = { handleSignIn };