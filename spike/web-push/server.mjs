// SPIKE desechable (WP-S2-1, D-21). No se integra a main.
// Servidor local mínimo para probar Web Push de punta a punta sin Vercel:
//   GET  /               página de prueba
//   GET  /sw.js          service worker (push + notificationclick)
//   GET  /config         clave pública VAPID
//   POST /subscribe      guarda la suscripción (en la carpeta temporal del sistema, fuera del repo)
//   POST /send?delay=N   envía un aviso a las suscripciones guardadas después de N segundos
// Uso (PowerShell, en la raíz del repo): node spike/web-push/server.mjs
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import webpush from 'web-push';

process.loadEnvFile('.env.local');
const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const PORT = 8787;
const HERE = new URL('.', import.meta.url);
const DATA_DIR = join(tmpdir(), 'tamalecho-spike');
const SUBS_FILE = join(DATA_DIR, 'subscriptions.json');

async function loadSubs() {
  if (!existsSync(SUBS_FILE)) return [];
  return JSON.parse(await readFile(SUBS_FILE, 'utf8'));
}

async function saveSubs(subs) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(SUBS_FILE, JSON.stringify(subs, null, 2));
}

async function readBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 10_000) throw new Error('Cuerpo demasiado grande');
  }
  return JSON.parse(body || '{}');
}

// Envía a todas las suscripciones y borra las caducadas (404/410).
async function sendAll(payload) {
  const subs = await loadSubs();
  const alive = [];
  const results = [];
  for (const sub of subs) {
    try {
      const res = await webpush.sendNotification(sub, JSON.stringify(payload));
      results.push({ endpoint: sub.endpoint.slice(0, 40) + '…', status: res.statusCode });
      alive.push(sub);
    } catch (error) {
      results.push({ endpoint: sub.endpoint.slice(0, 40) + '…', status: error.statusCode, error: error.body });
      if (![404, 410].includes(error.statusCode)) alive.push(sub);
    }
  }
  await saveSubs(alive);
  return results;
}

const send = (res, status, body, type = 'application/json') => {
  res.writeHead(status, { 'Content-Type': type });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
};

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (req.method === 'GET' && url.pathname === '/') {
      return send(res, 200, await readFile(new URL('index.html', HERE)), 'text/html; charset=utf-8');
    }
    if (req.method === 'GET' && url.pathname === '/sw.js') {
      return send(res, 200, await readFile(new URL('sw.js', HERE)), 'text/javascript');
    }
    if (req.method === 'GET' && url.pathname === '/config') {
      return send(res, 200, { publicKey: VAPID_PUBLIC_KEY });
    }
    if (req.method === 'POST' && url.pathname === '/subscribe') {
      const sub = await readBody(req);
      if (!sub.endpoint?.startsWith('https://') || !sub.keys?.p256dh || !sub.keys?.auth) {
        return send(res, 400, { error: 'Suscripción inválida' });
      }
      const subs = (await loadSubs()).filter((item) => item.endpoint !== sub.endpoint);
      await saveSubs([...subs, sub]);
      console.log(`Suscripción guardada (${new URL(sub.endpoint).host}). Total: ${subs.length + 1}`);
      return send(res, 201, { ok: true, total: subs.length + 1 });
    }
    if (req.method === 'POST' && url.pathname === '/send') {
      const delay = Math.min(Number(url.searchParams.get('delay') ?? 0), 120);
      send(res, 202, { ok: true, delay });
      // El envío ocurre en el servidor aunque la pestaña ya esté cerrada.
      setTimeout(async () => {
        const sentAt = new Date();
        const results = await sendAll({
          title: 'TamalEcho Tips · prueba del spike',
          body: 'Product Backlog: ordena el trabajo por valor y reordénalo conforme aprendes.',
          url: '/?desde=aviso',
          sentAt: sentAt.toISOString(),
        });
        console.log(`[${sentAt.toLocaleTimeString()}] Envío:`, results);
      }, delay * 1000);
      return;
    }
    send(res, 404, { error: 'No encontrado' });
  } catch (error) {
    send(res, 500, { error: error.message });
  }
}).listen(PORT, () => {
  console.log(`Spike de Web Push en http://localhost:${PORT}`);
  console.log(`Suscripciones en: ${SUBS_FILE}`);
});
