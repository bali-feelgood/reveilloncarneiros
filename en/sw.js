// Service Worker - Réveillon Carneiros 2026
// Cache estratégico para performance e offline

const CACHE_NAME = 'reveillon-carneiros-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Assets críticos para cache imediato
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/fonts.css', 
  '/js/main.js',
  '/manifest.json',
  '/assets/fonts/Amagro-bold.woff2',
  '/assets/fonts/SFProDisplay-Regular.woff2',
  '/assets/images/hero/hero-background.webp',
  '/assets/images/hero/hero-background-768.webp'
];

// Assets para cache dinâmico (sob demanda)
const CACHE_STRATEGIES = {
  images: {
    pattern: /\.(jpg|jpeg|png|webp|gif|svg)$/,
    strategy: 'cacheFirst',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    maxEntries: 100
  },
  fonts: {
    pattern: /\.(woff|woff2|ttf|eot)$/,
    strategy: 'cacheFirst', 
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 ano
    maxEntries: 20
  },
  api: {
    pattern: /\/api\//,
    strategy: 'networkFirst',
    maxAge: 5 * 60 * 1000, // 5 minutos
    maxEntries: 50
  }
};

// Install Event - Cache assets críticos
self.addEventListener('install', event => {
  console.log('🚀 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Service Worker: Error caching static assets:', error);
      })
  );
});

// Activate Event - Limpa caches antigos
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Old caches cleaned');
      return self.clients.claim();
    })
  );
});

// Fetch Event - Estratégias de cache
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requests externos e chrome-extension
  if (!url.origin.includes(self.location.origin) || url.protocol === 'chrome-extension:') {
    return;
  }

  // Estratégia para diferentes tipos de assets
  const strategy = getStrategyForRequest(request);
  
  event.respondWith(
    handleRequestWithStrategy(request, strategy)
  );
});

// Determina estratégia baseada no tipo de request
function getStrategyForRequest(request) {
  const url = request.url;
  
  // Verifica se é imagem
  if (CACHE_STRATEGIES.images.pattern.test(url)) {
    return { ...CACHE_STRATEGIES.images, cacheName: DYNAMIC_CACHE };
  }
  
  // Verifica se é fonte
  if (CACHE_STRATEGIES.fonts.pattern.test(url)) {
    return { ...CACHE_STRATEGIES.fonts, cacheName: STATIC_CACHE };
  }
  
  // Verifica se é API
  if (CACHE_STRATEGIES.api.pattern.test(url)) {
    return { ...CACHE_STRATEGIES.api, cacheName: DYNAMIC_CACHE };
  }
  
  // Estratégia padrão para HTML/CSS/JS
  return {
    strategy: 'staleWhileRevalidate',
    cacheName: STATIC_CACHE,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  };
}

// Aplica estratégia de cache específica
async function handleRequestWithStrategy(request, config) {
  const { strategy, cacheName, maxAge } = config;
  
  switch (strategy) {
    case 'cacheFirst':
      return cacheFirst(request, cacheName, maxAge);
    case 'networkFirst':
      return networkFirst(request, cacheName, maxAge);
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request, cacheName, maxAge);
    default:
      return fetch(request);
  }
}

// Cache First - Para assets estáticos
async function cacheFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, maxAge)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('🔌 Service Worker: Network failed, serving cache:', request.url);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Network First - Para APIs
async function networkFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('🔌 Service Worker: Network failed, trying cache:', request.url);
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate - Para HTML/CSS/JS
async function staleWhileRevalidate(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Sempre tenta buscar do network em background
  const networkPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    console.log('🔌 Service Worker: Network failed for:', request.url);
  });
  
  // Retorna cache imediatamente se disponível
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Senão, aguarda network
  return networkPromise;
}

// Verifica se response está expirado
function isExpired(response, maxAge) {
  if (!maxAge) return false;
  
  const date = response.headers.get('date');
  if (!date) return false;
  
  const responseTime = new Date(date).getTime();
  return (Date.now() - responseTime) > maxAge;
}

// Background Sync para form submissions offline
self.addEventListener('sync', event => {
  if (event.tag === 'newsletter-sync') {
    event.waitUntil(syncNewsletterData());
  }
});

// Sincroniza dados do newsletter quando volta online
async function syncNewsletterData() {
  try {
    // Aqui implementaria a lógica de sincronização
    console.log('📬 Service Worker: Syncing newsletter data...');
  } catch (error) {
    console.error('❌ Service Worker: Sync failed:', error);
  }
}

// Notificações Push (futuro)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/assets/images/icons/icon-192x192.png',
      badge: '/assets/images/icons/icon-72x72.png',
      tag: 'reveillon-notification',
      requireInteraction: true
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

console.log('🎉 Service Worker: Loaded successfully!');