export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const CLOUD  = process.env.CLOUDINARY_CLOUD || 'lrd7rkfa';
    const KEY    = process.env.CLOUDINARY_KEY   || '149949272755528';
    const SECRET = process.env.CLOUDINARY_SECRET|| 'jgXjz5kM4IJKBNyfIrFZcI7KeGo';
    const AUTH   = 'Basic ' + Buffer.from(KEY + ':' + SECRET).toString('base64');

    async function fetchType(type) {
        const r = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD}/resources/${type}?max_results=500`,
            { headers: { Authorization: AUTH } }
        );
        if (!r.ok) throw new Error(`Cloudinary ${type} fetch failed: ${r.status}`);
        const d = await r.json();
        return (d.resources || []).map(resource => ({
            type,
            publicId: resource.public_id,
            fmt: resource.format,
        }));
    }

    try {
        const [images, videos] = await Promise.all([fetchType('image'), fetchType('video')]);
        res.status(200).json({ media: [...images, ...videos] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
