import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // In-memory server-side cache for instant repeat lookups
  const serverAvatarCache = new Map<string, any>();
  const serverProfileCache = new Map<string, any>();

  // 1. Profile Lookup by Username or User ID
  app.get('/api/roblox/profile', async (req, res) => {
    try {
      const query = ((req.query.query as string) || (req.query.username as string) || '').trim();
      if (!query) {
        return res.status(400).json({ error: 'Missing username or query parameter' });
      }

      const cleanQuery = query.replace(/^@/, '');
      const cleanLower = cleanQuery.toLowerCase();

      if (serverProfileCache.has(cleanLower)) {
        return res.json(serverProfileCache.get(cleanLower));
      }

      const isNumeric = /^\d+$/.test(cleanQuery);
      let userId: number | null = null;
      let username = cleanQuery;
      let displayName = cleanQuery;
      let hasVerifiedBadge = false;

      if (isNumeric) {
        userId = parseInt(cleanQuery, 10);
      } else {
        // Look up by exact username
        try {
          const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [cleanQuery], excludeBannedUsers: false }),
          });
          if (userRes.ok) {
            const userData = (await userRes.json()) as { data?: Array<{ id: number; name: string; displayName: string; hasVerifiedBadge?: boolean }> };
            if (userData?.data && userData.data.length > 0) {
              userId = userData.data[0].id;
              username = userData.data[0].name;
              displayName = userData.data[0].displayName;
              hasVerifiedBadge = !!userData.data[0].hasVerifiedBadge;
            }
          }
        } catch (e) {
          console.warn('Roblox usernames API error:', e);
        }

        // Fallback to keyword search
        if (!userId) {
          try {
            const searchRes = await fetch(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(cleanQuery)}&limit=10`);
            if (searchRes.ok) {
              const searchData = (await searchRes.json()) as { data?: Array<{ id: number; name: string; displayName: string; hasVerifiedBadge?: boolean }> };
              if (searchData?.data && searchData.data.length > 0) {
                const matched =
                  searchData.data.find((u) => u.name.toLowerCase() === cleanQuery.toLowerCase()) ||
                  searchData.data.find((u) => u.displayName.toLowerCase() === cleanQuery.toLowerCase()) ||
                  searchData.data[0];
                userId = matched.id;
                username = matched.name;
                displayName = matched.displayName;
                hasVerifiedBadge = !!matched.hasVerifiedBadge;
              }
            }
          } catch (e) {
            console.warn('Roblox search API error:', e);
          }
        }
      }

      if (!userId) {
        return res.status(404).json({ error: `Roblox user "${cleanQuery}" not found` });
      }

      // Fetch user profile details, headshot, and fullbody avatar
      const [detailsRes, headshotRes, fullbodyRes] = await Promise.allSettled([
        fetch(`https://users.roblox.com/v1/users/${userId}`),
        fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`),
        fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`),
      ]);

      let description = '';
      let joinYear = 2020;
      let created = '';

      if (detailsRes.status === 'fulfilled' && detailsRes.value.ok) {
        const detailsData = (await detailsRes.value.json()) as {
          id: number;
          name: string;
          displayName: string;
          description?: string;
          created?: string;
          hasVerifiedBadge?: boolean;
        };
        if (detailsData) {
          username = detailsData.name || username;
          displayName = detailsData.displayName || displayName;
          description = detailsData.description || '';
          created = detailsData.created || '';
          if (detailsData.hasVerifiedBadge !== undefined) {
            hasVerifiedBadge = !!detailsData.hasVerifiedBadge;
          }
          if (created) {
            joinYear = new Date(created).getFullYear();
          }
        }
      }

      let avatarUrl = '';
      if (headshotRes.status === 'fulfilled' && headshotRes.value.ok) {
        const headshotData = (await headshotRes.value.json()) as { data?: Array<{ targetId: number; imageUrl: string; state: string }> };
        if (headshotData?.data?.[0]?.imageUrl && headshotData.data[0].state === 'Completed') {
          avatarUrl = headshotData.data[0].imageUrl;
        }
      }

      // Fallback headshot if 420x420 pending or missing
      if (!avatarUrl) {
        try {
          const fallbackHeadshot = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`);
          if (fallbackHeadshot.ok) {
            const fallbackData = (await fallbackHeadshot.json()) as { data?: Array<{ targetId: number; imageUrl: string; state?: string }> };
            if (fallbackData?.data?.[0]?.imageUrl) {
              avatarUrl = fallbackData.data[0].imageUrl;
            }
          }
        } catch (_) {}
      }

      let avatarFullBodyUrl = '';
      if (fullbodyRes.status === 'fulfilled' && fullbodyRes.value.ok) {
        const fullData = (await fullbodyRes.value.json()) as { data?: Array<{ targetId: number; imageUrl: string; state: string }> };
        avatarFullBodyUrl = fullData?.data?.[0]?.imageUrl || '';
      }

      const profileResult = {
        id: userId,
        username,
        displayName,
        description,
        bio: description,
        hasVerifiedBadge,
        isVerified: hasVerifiedBadge,
        joinYear,
        created,
        avatarUrl,
        avatarHeadshotUrl: avatarUrl,
        avatarFullBodyUrl,
      };

      serverProfileCache.set(cleanLower, profileResult);
      if (avatarUrl) {
        serverAvatarCache.set(cleanLower, { id: userId, username, displayName, avatarUrl });
      }

      return res.json(profileResult);
    } catch (err) {
      console.error('API profile error:', err);
      return res.status(500).json({ error: 'Failed to fetch Roblox profile' });
    }
  });

  // 2. User Search by Keyword
  app.get('/api/roblox/search', async (req, res) => {
    try {
      const query = ((req.query.query as string) || '').trim();
      if (!query) {
        return res.json({ players: [] });
      }

      const [searchRes, exactRes] = await Promise.allSettled([
        query.length >= 3
          ? fetch(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(query)}&limit=10`)
          : Promise.resolve(null),
        fetch('https://users.roblox.com/v1/usernames/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usernames: [query], excludeBannedUsers: false }),
        }),
      ]);

      const usersMap = new Map<number, { id: number; name: string; displayName: string; hasVerifiedBadge?: boolean }>();

      if (exactRes.status === 'fulfilled' && exactRes.value && exactRes.value.ok) {
        const exactData = (await exactRes.value.json()) as { data?: Array<{ id: number; name: string; displayName: string; hasVerifiedBadge?: boolean }> };
        if (exactData?.data) {
          for (const u of exactData.data) {
            usersMap.set(u.id, u);
          }
        }
      }

      if (searchRes.status === 'fulfilled' && searchRes.value && searchRes.value.ok) {
        const searchData = (await searchRes.value.json()) as { data?: Array<{ id: number; name: string; displayName: string; hasVerifiedBadge?: boolean }> };
        if (searchData?.data) {
          for (const u of searchData.data) {
            if (!usersMap.has(u.id)) {
              usersMap.set(u.id, u);
            }
          }
        }
      }

      const users = Array.from(usersMap.values());
      if (users.length === 0) {
        return res.json({ players: [] });
      }

      const userIds = users.slice(0, 10).map((u) => u.id).join(',');
      const thumbRes = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIds}&size=150x150&format=Png&isCircular=false`
      );
      const thumbMap = new Map<number, string>();
      if (thumbRes.ok) {
        const thumbData = (await thumbRes.json()) as { data?: Array<{ targetId: number; imageUrl: string; state: string }> };
        if (thumbData?.data) {
          for (const t of thumbData.data) {
            if (t.imageUrl && t.state === 'Completed') {
              thumbMap.set(t.targetId, t.imageUrl);
            }
          }
        }
      }

      const players = users.slice(0, 10).map((u) => ({
        id: String(u.id),
        username: u.name,
        displayName: u.displayName,
        hasVerifiedBadge: !!u.hasVerifiedBadge,
        avatarUrl: thumbMap.get(u.id) || '',
      }));

      return res.json({ players });
    } catch (err) {
      console.error('API search error:', err);
      return res.status(500).json({ error: 'Failed to search players' });
    }
  });

  // 3. User Avatar by Username
  app.get('/api/roblox/avatar', async (req, res) => {
    try {
      const username = ((req.query.username as string) || '').trim();
      if (!username) {
        return res.json({ avatarUrl: null });
      }

      const cleanLower = username.toLowerCase().replace(/^@/, '');
      if (serverAvatarCache.has(cleanLower)) {
        return res.json(serverAvatarCache.get(cleanLower));
      }

      const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: [cleanLower], excludeBannedUsers: false }),
      });

      if (!userRes.ok) {
        return res.json({ avatarUrl: null });
      }

      const userData = (await userRes.json()) as { data?: Array<{ id: number; name: string; displayName: string }> };
      const found = userData?.data?.[0];
      if (!found) {
        return res.json({ avatarUrl: null });
      }

      const thumbRes = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${found.id}&size=150x150&format=Png&isCircular=false`
      );
      let avatarUrl: string | null = null;
      if (thumbRes.ok) {
        const thumbData = (await thumbRes.json()) as { data?: Array<{ targetId: number; imageUrl: string; state: string }> };
        avatarUrl = thumbData?.data?.[0]?.imageUrl || null;
      }

      const result = { id: found.id, username: found.name, displayName: found.displayName, avatarUrl };
      serverAvatarCache.set(cleanLower, result);
      return res.json(result);
    } catch (err) {
      console.error('API avatar error:', err);
      return res.status(500).json({ error: 'Failed to fetch avatar' });
    }
  });

  // 4. Game Details Lookup
  app.get('/api/roblox/game-details', async (req, res) => {
    try {
      const query = ((req.query.placeId as string) || (req.query.url as string) || (req.query.query as string) || '').trim();
      if (!query) {
        return res.status(400).json({ error: 'Missing placeId parameter' });
      }

      const placeIdMatch = query.match(/\d{5,}/);
      if (!placeIdMatch) {
        return res.status(400).json({ error: 'Could not extract valid Roblox Place ID' });
      }

      const placeId = parseInt(placeIdMatch[0], 10);
      const uniRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
      if (!uniRes.ok) {
        return res.status(404).json({ error: 'Experience not found on Roblox' });
      }

      const uniData = (await uniRes.json()) as { universeId?: number };
      const universeId = uniData?.universeId;
      if (!universeId) {
        return res.status(404).json({ error: 'Could not resolve Roblox universe' });
      }

      const [detailsRes, votesRes, iconRes, bannerRes] = await Promise.all([
        fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`).then((r) => r.json()).catch(() => null),
        fetch(`https://games.roblox.com/v1/games/${universeId}/votes`).then((r) => r.json()).catch(() => null),
        fetch(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeId}&size=512x512&format=Png&isCircular=false`).then((r) => r.json()).catch(() => null),
        fetch(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeId}&countPerUniverse=1&defaults=true&size=768x432&format=Png&isCircular=false`).then((r) => r.json()).catch(() => null),
      ]);

      const game = detailsRes?.data?.[0];
      if (!game) {
        return res.status(404).json({ error: 'Game details unavailable from Roblox API' });
      }

      let rating = '90% Rating';
      if (votesRes?.upVotes !== undefined && votesRes?.downVotes !== undefined) {
        const total = votesRes.upVotes + votesRes.downVotes;
        if (total > 0) {
          const pct = Math.round((votesRes.upVotes / total) * 100);
          rating = `${pct}% Rating`;
        }
      }

      let playersFormatted = '12.5K';
      const playing = game.playing ?? 0;
      if (playing >= 1000000) {
        playersFormatted = `${(playing / 1000000).toFixed(1)}M`;
      } else if (playing >= 1000) {
        playersFormatted = `${(playing / 1000).toFixed(playing >= 10000 ? 0 : 1)}K`;
      } else if (playing > 0) {
        playersFormatted = `${playing}`;
      }

      const iconUrl = iconRes?.data?.[0]?.imageUrl || '';
      const bannerUrl = bannerRes?.data?.[0]?.thumbnails?.[0]?.imageUrl || iconUrl;

      return res.json({
        placeId,
        universeId,
        title: game.name || 'Roblox Experience',
        description: game.description || '',
        creator: game.creator?.name || 'Official Creator',
        genre: game.genre || game.genre_l1 || 'Adventure',
        rating,
        players: playersFormatted,
        iconUrl,
        bannerUrl,
      });
    } catch (err) {
      console.error('API game-details error:', err);
      return res.status(500).json({ error: 'Failed to fetch game details' });
    }
  });

  // Ensure any other /api/* route returns JSON 404, NEVER html!
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  // ==========================================
  // VITE / STATIC SERVING
  // ==========================================
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
