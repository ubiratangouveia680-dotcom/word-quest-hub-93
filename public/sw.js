// Service Worker para Bíblia Online - Notificações do Versículo do Dia e Mural de Oração
const CACHE_NAME = 'biblia-online-sw-v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Tratamento de notificações push recebidas
self.addEventListener('push', (event) => {
  let data = {
    title: '🌙 Versículo da Noite',
    body: 'Toque para ler o versículo completo na Bíblia Online.',
    url: '/versiculo-do-dia',
    tag: 'versiculo-da-noite',
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

  // URLs absolutas garantem renderização correta do ícone no NotificationManager do Android
  const iconUrl = new URL('/icon-192.png', self.location.origin).href;
  const badgeUrl = new URL('/favicon.png', self.location.origin).href;

  const options = {
    body: data.body,
    icon: data.icon || iconUrl,
    badge: data.badge || badgeUrl,
    tag: data.tag || 'versiculo-da-noite',
    data: {
      url: data.url || '/versiculo-do-dia',
    },
    vibrate: [100, 50, 100],
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Ação ao tocar/clicar na notificação: abre diretamente a página do Versículo do Dia
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const rawUrl = (event.notification.data && event.notification.data.url) || '/versiculo-do-dia';
  const targetUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já houver uma aba aberta com o site Bíblia Online, foca nela e navega diretamente
      for (const client of clientList) {
        if (client.url && client.url.startsWith(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Se nenhuma aba estiver aberta, abre uma nova janela
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

