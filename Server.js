// api/proxy.js
const axios = require('axios');

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing "url" query parameter' });
  }

  const excludedHeaders = ['host', 'connection', 'content-length'];

  // Filtrar e copiar headers do cliente
  const forwardedHeaders = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!excludedHeaders.includes(key.toLowerCase())) {
      forwardedHeaders[key] = value;
    }
  }

  try {
    const response = await axios.get(url, {
      headers: forwardedHeaders
    });

    // Definir cabeçalhos CORS para permitir o acesso ao recurso
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Retornar a resposta do proxy para o cliente
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Error fetching the requested URL:', error);
    res.status(500).json({ error: 'Error fetching the requested URL' });
  }
};
