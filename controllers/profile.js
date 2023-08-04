const handleGetProfileById = (request, response, database) => {
  const { id } = request.params;

  database('users')
    .select('*')
    .where({ id })
    .then((users) => { 
      if (users.length) response.json(users[0])
      else response.status(400).json('User not found') 
    })
    .catch(() => response.status(400).json('Error getting user'))
}

module.exports = { handleGetProfileById };