const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const uid = req.query.uid || req.query.id;
  const region = (req.query.region || 'NA').toUpperCase();

  if (!uid) {
    return res.status(400).json({ error: 'Missing uid parameter' });
  }

  // Consulta a múltiples fuentes públicas de respaldo
  const sources = [
    `https://freefire-api-seven.vercel.app/api/info?uid=${uid}&region=${region}`,
    `https://ff-api-src.vercel.app/api/player?uid=${uid}&region=${region}`
  ];

  for (const url of sources) {
    try {
      const response = await axios.get(url, { timeout: 6000 });
      if (response.data && !response.data.error) {
        return res.status(200).json(response.data);
      }
    } catch (e) {
      // Pasa a la siguiente fuente
    }
  }

  // Respaldo directo desde Pagostore (Garena)
  try {
    const pagostoreRes = await axios.post('https://pagostore.com/api/auth/player_id_login', {
      app_id: 100067,
      login_id: uid
    }, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 5000
    });

    if (pagostoreRes.data && pagostoreRes.data.nickname) {
      return res.status(200).json({
        basicInfo: {
          nickname: pagostoreRes.data.nickname,
          accountId: uid,
          region: region,
          level: 1,
          liked: 0
        }
      });
    }
  } catch (e) {
    // Si falla Pagostore
  }

  return res.status(500).json({ error: 'No se pudo obtener la información del jugador' });
};
