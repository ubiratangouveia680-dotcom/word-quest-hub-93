// Service Worker para Bíblia Online - Notificações Push (Versículo do Dia e Pedidos de Oração)
const CACHE_NAME = 'biblia-online-sw-v5';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Tratamento de notificações push recebidas mesmo com o site fechado
self.addEventListener('push', (event) => {
  let data = {
    title: '🙏 Novo pedido de oração',
    body: 'Alguém publicou um novo pedido de oração. Toque para orar.',
    url: '/comunidade/pedidos-de-oracao',
    tag: 'pedido-de-oracao',
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

  // URLs absolutas garantem renderização correta do ícone no Android e Windows
  const iconUrl = new URL(data.icon || '/icon-192.png', self.location.origin).href;
  const badgeUrl = new URL(data.badge || '/favicon.png', self.location.origin).href;

  const options = {
    body: data.body,
    icon: iconUrl,
    badge: badgeUrl,
    tag: data.tag || 'prayer-push-' + Date.now(),
    data: {
      url: data.url || '/comunidade/pedidos-de-oracao',
    },
    vibrate: [150, 80, 150],
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Ação ao tocar/clicar na notificação: abre diretamente a página/pedido de oração
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const rawUrl = (event.notification.data && event.notification.data.url) || '/comunidade/pedidos-de-oracao';
  const targetUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já houver uma aba aberta com a Bíblia Online, foca nela e navega diretamente
      for (const client of clientList) {
        if (client.url && client.url.startsWith(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Se o site estiver fechado, abre uma nova janela com o link direto do pedido
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Re-inscrição caso o navegador renove a chave de push
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options).then((subscription) => {
      // O cliente sincroniza automaticamente na próxima visita
    })
  );
});

