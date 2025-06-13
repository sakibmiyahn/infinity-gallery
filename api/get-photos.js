import axios from 'axios';

export default async function handler(req, res) {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

  const params = {
    count: req.query.count || 10,
  };

  if (req.query.query) params.query = req.query.query;

  try {
    const response = await axios.get('https://api.unsplash.com/photos/random', {
      params,
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error fetching from Unsplash');
  }
}
