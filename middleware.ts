/**
 * Routing Middleware Vercel : verrouille les matières privées (`"private": true` dans subjects.json).
 *
 * Le site est statique : les pages privées sont bien générées dans dist/, mais Vercel exécute ce middleware
 * avant de servir le fichier. Sans cookie de session valide, la requête est redirigée vers /connexion/.
 *
 * Variable d'environnement (Vercel → Settings → Environment Variables) :
 *   CORTEX_PASSWORD  mot de passe d'accès (long et aléatoire). Le changer déconnecte toutes les sessions.
 * Sans elle, les pages privées restent fermées et aucune connexion n'est possible.
 *
 * Visiteur connecté : / et /cours/ sont servis depuis /prive/accueil/ et /prive/cours/ (toutes les matières), les
 * leçons publiques depuis leur copie /prive/lecons/… (navigation latérale complète), et le cookie non secret
 * `cortex_connecte=1` indique à la recherche de fusionner l'index privé (/prive/pagefind/).
 *
 * En local (`npm run dev`, `npm run preview`, scripts de captures), ce middleware ne tourne pas : tout est visible.
 */
import { next, rewrite } from '@vercel/functions/middleware';
// L'attribut est obligatoire : Vercel exécute ce fichier en ESM Node.js natif, sans le regrouper (bundle)
import subjects from './src/content/subjects.json' with { type: 'json' };

export const config = {
  matcher: ['/', '/index.html', '/cours/:path*', '/prive', '/prive/:path*', '/connexion', '/connexion/', '/deconnexion', '/deconnexion/'],
};

const PRIVATE = new Set(
  (subjects as { id: string; private?: boolean }[]).filter((s) => s.private).map((s) => s.id.toLowerCase()),
);
const COOKIE = 'cortex_session';
/** Simple indicateur lisible en JS (aucun droit en soi) : la recherche s'en sert pour charger l'index privé. */
const FLAG = 'cortex_connecte';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

const enc = new TextEncoder();

function b64url(buf: ArrayBuffer) {
  let s = '';
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

/** Comparaison à temps constant (chaînes de même longueur : sorties HMAC). */
function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const secretOf = (password: string) => `cortex-session:${password}`;

async function makeToken(password: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  return `${exp}.${await hmac(secretOf(password), `session:${exp}`)}`;
}

async function validToken(password: string, token: string | undefined) {
  if (!token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  return same(sig, await hmac(secretOf(password), `session:${exp}`));
}

function readCookie(request: Request, name: string) {
  const header = request.headers.get('cookie') ?? '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return undefined;
}

/** Chemin normalisé (décodé, minuscules, sans `//`) pour qu'un encodage exotique ne contourne pas le verrou. */
function normalize(pathname: string) {
  let p = pathname;
  try {
    p = decodeURIComponent(p);
  } catch {}
  return p.toLowerCase().replace(/\/{2,}/g, '/');
}

function isProtected(path: string) {
  const [first, second] = path.split('/').filter(Boolean);
  if (first === 'prive') return true;
  return first === 'cours' && second !== undefined && PRIVATE.has(second.replace(/\.html$/, ''));
}

/** N'accepte qu'un chemin interne comme destination après connexion (pas de redirection ouverte). */
function safeNext(value: unknown) {
  return typeof value === 'string' && /^\/(?![/\\])/.test(value) ? value : '/cours/';
}

const redirect = (to: string | URL, headers: Record<string, string> = {}) =>
  new Response(null, { status: 303, headers: { Location: String(to), 'Cache-Control': 'no-store', ...headers } });

const cookies = (token: string, maxAge: number) => {
  const headers = new Headers({ Location: '', 'Cache-Control': 'no-store' });
  headers.append('Set-Cookie', `${COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`);
  headers.append('Set-Cookie', `${FLAG}=${maxAge > 0 ? 1 : ''}; Path=/; Max-Age=${maxAge}; Secure; SameSite=Lax`);
  return headers;
};

/** Redirection 303 qui pose (ou efface) les deux cookies. */
function redirectWithSession(to: URL, token: string, maxAge: number, extra: Record<string, string> = {}) {
  const headers = cookies(token, maxAge);
  headers.set('Location', String(to));
  for (const [k, v] of Object.entries(extra)) headers.set(k, v);
  return new Response(null, { status: 303, headers });
}

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const path = normalize(url.pathname);
  const password = process.env.CORTEX_PASSWORD ?? '';

  // Connexion : le formulaire statique de /connexion/ poste ici
  if (request.method === 'POST' && /^\/connexion\/?$/.test(path)) {
    const form = await request.formData().catch(() => null);
    const given = String(form?.get('password') ?? '');
    const target = safeNext(form?.get('suite'));
    const ok = password !== '' && same(await hmac(secretOf(password), `pw:${given}`), await hmac(secretOf(password), `pw:${password}`));
    if (!ok) {
      await new Promise((r) => setTimeout(r, 600)); // ralentit les essais en rafale
      const back = new URL('/connexion/', url);
      back.searchParams.set('erreur', password === '' ? 'config' : '1');
      back.searchParams.set('suite', target);
      return redirect(back);
    }
    return redirectWithSession(new URL(target, url), await makeToken(password), MAX_AGE);
  }

  if (/^\/deconnexion\/?$/.test(path)) {
    return redirectWithSession(new URL('/connexion/?sortie=1', url), '', 0, { 'Clear-Site-Data': '"cache"' });
  }

  const loggedIn = password !== '' && (await validToken(password, readCookie(request, COOKIE)));

  // Accueil et liste des cours : versions complètes (publiques + privées) pour un visiteur connecté
  const full = /^\/(index\.html)?$/.test(path) ? '/prive/accueil/' : /^\/cours(\/(index\.html)?)?$/.test(path) ? '/prive/cours/' : null;
  if (full) return loggedIn ? rewrite(new URL(full, url), { headers: { 'Cache-Control': 'private, no-store' } }) : next();

  // Leçon d'une matière publique : copie avec la navigation latérale complète pour un visiteur connecté
  const lesson = path.match(/^\/cours\/([a-z0-9-]+)\/([a-z0-9-]+)\/?(index\.html)?$/);
  if (lesson && !PRIVATE.has(lesson[1])) {
    return loggedIn
      ? rewrite(new URL(`/prive/lecons/${lesson[1]}/${lesson[2]}/`, url), { headers: { 'Cache-Control': 'private, no-store' } })
      : next();
  }

  if (!isProtected(path)) return next(); // rien à faire : Vercel sert le fichier statique

  if (loggedIn) return next({ headers: { 'Cache-Control': 'private, no-store' } });

  const login = new URL('/connexion/', url);
  login.searchParams.set('suite', url.pathname);
  return redirect(login);
}
