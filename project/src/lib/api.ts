// Frontend API client for the Express and MongoDB backend.
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'feedbackhub_token';
const USER_KEY = 'feedbackhub_user';
const token = () => localStorage.getItem(TOKEN_KEY);
async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}), ...options.headers },
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message || 'Request failed');
  return body;
}
function authResult(error: unknown) { return { data: null, error: error instanceof Error ? error : new Error('Request failed') }; }
const currentUser = () => { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; } };
function setAuth(data: any) { localStorage.setItem(TOKEN_KEY, data.token); localStorage.setItem(USER_KEY, JSON.stringify(data.user)); window.dispatchEvent(new Event('feedbackhub-auth')); }

class Query {
  table: string; action = 'select'; payload: any = null; filters: Record<string, string> = {}; ordering = ''; ascending = false; max = 0; inFilter = '';
  constructor(table: string) { this.table = table; }
  select(_fields = '*') { if (this.action === 'select') this.action = 'select'; return this; }
  eq(key: string, value: any) { this.filters[key] = String(value); return this; }
  in(key: string, values: any[]) { if (key === 'id') this.inFilter = values.join(','); return this; }
  order(key: string, options?: { ascending?: boolean }) { this.ordering = key; this.ascending = options?.ascending !== false; return this; }
  limit(value: number) { this.max = value; return this; }
  insert(payload: any) { this.action = 'insert'; this.payload = payload; return this; }
  update(payload: any) { this.action = 'update'; this.payload = payload; return this; }
  delete() { this.action = 'delete'; return this; }
  async maybeSingle() { const result = await this.execute(); return { data: Array.isArray(result.data) ? result.data[0] ?? null : result.data, error: result.error }; }
  then(resolve: (value: any) => any, reject?: (reason: any) => any) { return this.execute().then(resolve, reject); }
  async execute() {
    try {
      let path = `/${this.table}`;
      if (this.action === 'select') {
        const params = new URLSearchParams(this.filters);
        if (this.ordering) { params.set('orderBy', this.ordering); params.set('ascending', String(this.ascending)); }
        if (this.max) params.set('limit', String(this.max));
        if (this.inFilter) params.set('in_id', this.inFilter);
        if (this.table === 'feedback') params.set('withProduct', 'true');
        const data = await request(`${path}?${params}`);
        return { data, error: null };
      }
      if (this.action === 'insert') {
        const data = await request(path, { method: 'POST', body: JSON.stringify(this.payload) });
        return { data, error: null };
      }
      const id = this.filters.id;
      if (!id) throw new Error('Record id is required');
      if (this.action === 'update') {
        const data = await request(`${path}/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(this.payload) });
        return { data, error: null };
      }
      await request(`${path}/${encodeURIComponent(id)}`, { method: 'DELETE' });
      return { data: null, error: null };
    } catch (error) { return authResult(error); }
  }
}

export const api = {
  from: (table: string) => new Query(table),
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try { const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); setAuth(data); return { data, error: null }; }
      catch (error) { return authResult(error); }
    },
    signUp: async ({ email, password, options }: any) => {
      try { const data = await request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, full_name: options?.data?.full_name, admin_code: options?.data?.admin_code }) }); setAuth(data); return { data: { user: data.user }, error: null }; }
      catch (error) { return authResult(error); }
    },
    getSession: async () => {
      if (!token()) return { data: { session: null }, error: null };
      try {
        const data = await request('/auth/me');
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        const user = data.user;
        return { data: { session: { access_token: token(), user } }, error: null };
      } catch (error) { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); return { data: { session: null }, error: error as Error }; }
    },
    signOut: async () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); window.dispatchEvent(new Event('feedbackhub-auth')); return { error: null }; },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      const listener = () => { const user = currentUser(); callback('SIGNED_IN', user ? { user, access_token: token() } : null); };
      window.addEventListener('feedbackhub-auth', listener);
      return { data: { subscription: { unsubscribe: () => window.removeEventListener('feedbackhub-auth', listener) } } };
    },
  },
};
