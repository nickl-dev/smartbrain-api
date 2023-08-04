const clarifai = require('clarifai');
const clarifaiApp = new clarifai.App({ apiKey: process.env.CLARIFAI_API_KEY });

const handleClarifaiApiCall = (request, response) => {
  clarifaiApp.models.predict('face-detection', request.body.input)
  .then((data) => response.json(data))
  .catch(() => response.status(400).json('Unable to work with API'))
}

const handleImage = (request, response, database) => {
  const { id } = request.body;

  database('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then((entries) => response.json(entries[0].entries))
    .catch(() => response.status(400).json('Unable to get entries'))
}

module.exports = {
  handleClarifaiApiCall,
  handleImage
}