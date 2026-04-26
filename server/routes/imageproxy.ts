import ImageProxy from '@server/lib/imageproxy';
import logger from '@server/logger';
import { Router } from 'express';

const router = Router();

// Delay the initialization of ImageProxy instances until the proxy (if any) is properly configured
let _tmdbImageProxy: ImageProxy;
function initTmdbImageProxy() {
  if (!_tmdbImageProxy) {
    _tmdbImageProxy = new ImageProxy('tmdb', 'https://image.tmdb.org', {
      rateLimitOptions: {
        maxRequests: 20,
        maxRPS: 50,
      },
    });
  }
  return _tmdbImageProxy;
}
let _tvdbImageProxy: ImageProxy;
function initTvdbImageProxy() {
  if (!_tvdbImageProxy) {
    _tvdbImageProxy = new ImageProxy('tvdb', 'https://artworks.thetvdb.com', {
      rateLimitOptions: {
        maxRequests: 20,
        maxRPS: 50,
      },
    });
  }
  return _tvdbImageProxy;
}

router.get('/:type/*', async (req, res) => {
  const imagePath = req.path.replace(/^\/\w+/, '');

  if (req.params.type === 'tmdb') {
    if (
      !imagePath.match(/^(\/t\/p\/[\w-]{1,255}){1}(\/[\w-]{1,255})+\.(jpg|jpeg|png|webp|svg)$/)
    ) {
      logger.error('Invalid TMDB image path for image proxy', { imagePath });
      return res.status(403).send('Invalid TMDB image path for image proxy');
    }
  } else if (req.params.type === 'tvdb') {
    if (!imagePath.match(/^(\/[\w-]{1,255})+\.(jpg|jpeg|png|webp|svg)$/)) {
      logger.error('Invalid TVDB image path for image proxy', { imagePath });
      return res.status(403).send('Invalid TVDB image path for image proxy');
    }
  } else {
    logger.error('Unsupported image type', {
      imagePath,
      type: req.params.type,
    });
    return res.status(400).send('Unsupported image type');
  }

  try {
    let imageData;
    if (req.params.type === 'tmdb') {
      imageData = await initTmdbImageProxy().getImage(imagePath);
    } else if (req.params.type === 'tvdb') {
      imageData = await initTvdbImageProxy().getImage(imagePath);
    } else {
      return res.status(400).send('Unsupported image type');
    }

    res.writeHead(200, {
      'Content-Type': `image/${imageData.meta.extension}`,
      'Content-Length': imageData.imageBuffer.length,
      'Cache-Control': `public, max-age=${imageData.meta.curRevalidate}`,
      'OS-Cache-Key': imageData.meta.cacheKey,
      'OS-Cache-Status': imageData.meta.cacheMiss ? 'MISS' : 'HIT',
    });

    res.end(imageData.imageBuffer);
  } catch (e) {
    logger.error('Failed to proxy image', {
      imagePath,
      errorMessage: e.message,
    });
    res.status(500).send();
  }
});

export default router;
