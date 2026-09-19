// Service Worker para Word Quest Hub - Notificações do Versículo do Dia
const CACHE_NAME = 'word-quest-sw-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Tratamento de notificações push recebidas
self.addEventListener('push', (event) => {
  let data = {
    title: 'Versículo do Dia — Word Quest Hub',
    body: 'Toque para ler o versículo completo.',
    url: '/versiculo-do-dia',
    tag: 'daily-verse',
  };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/favicon.png',
    tag: data.tag || 'daily-verse',
    data: {
      url: data.url || '/versiculo-do-dia',
    },
    vibrate: [100, 50, 100],
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Ação ao tocar/clicar na notificação: abre diretamente a página do Versículo do Dia
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/versiculo-do-dia';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já houver uma aba aberta com o site, foca nela e navega
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Se não houver, abre uma nova janela
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
