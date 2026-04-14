'use client';

import { useState } from 'react';

export function LoginCard() {
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: any) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, password }),
      });
      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || 'Credenciales incorrectas');
      }
      window.location.href = '/mi-club';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-card" onSubmit={submit}>
      <img src="/logo.svg" alt="" className="login-card__logo" />
      <div className="login-card__copy">
        <h2>Mi Club</h2>
        <p>Acceso privado</p>
      </div>

      <label className="field">
        <span>@usuario</span>
        <input value={handle} onChange={(event: any) => setHandle(event.target.value)} placeholder="@usuario" autoComplete="username" />
      </label>

      <label className="field">
        <span>Contraseña</span>
        <div className="field__password">
          <input
            value={password}
            onChange={(event: any) => setPassword(event.target.value)}
            placeholder="Contraseña"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
          />
          <button type="button" className="field__toggle" onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
      </label>

      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      {error ? <p className="form-error">{error}</p> : null}
      <p className="login-card__hint">Demo: @usuario01 a @usuario20 · contraseña mundial2026</p>
    </form>
  );
}
