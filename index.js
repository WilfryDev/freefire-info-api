module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const uid = req.query.uid || req.query.id;
    const region = (req.query.region || 'NA').toUpperCase();

    if (!uid) {
      return res.status(400).json({ error: 'Falta el parámetro UID' });
    }

    // Consulta directa a la API de Pagostore (Servidor oficial de Garena)
    const response = await fetch('https://pagostore.com/api/auth/player_id_login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        app_id: 100067,
        login_id: String(uid)
      })
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Error al conectar con los servidores de Garena' });
    }

    const data = await response.json();

    if (data && data.nickname) {
      return res.status(200).json({
        basicInfo: {
          nickname: data.nickname,
          accountId: uid,
          region: region,
          level: 1,
          liked: 0
        }
      });
    }

    return res.status(404).json({ error: 'ID de jugador no encontrado' });

  } catch (err) {
    return res.status(500).json({ error: 'Error interno en la función serverless', details: err.message });
  }
};
