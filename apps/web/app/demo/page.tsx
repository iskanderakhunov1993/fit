"use client";

import { useState, useEffect } from "react";
import { MiraLogo } from "@/components/ui/MiraLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { writeData } from "@/lib/store";
import type { MiraLocalData } from "@/lib/types";

type DemoUser = {
  login: string;
  password: string;
  name: string;
  description: string;
  data: MiraLocalData;
};

export default function DemoPage() {
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/demo-users.json")
      .then(r => r.json())
      .then(d => setUsers(d.users))
      .catch(() => {});
  }, []);

  function handleLogin() {
    const user = users.find(u => u.login === login && u.password === password);
    if (!user) {
      setError("Неверный логин или пароль");
      return;
    }
    writeData(user.data);
    window.location.href = "/";
  }

  function quickLogin(user: DemoUser) {
    writeData(user.data);
    window.location.href = "/";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mira-bg px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <MiraLogo size={64} />
          <h1 className="mt-4 text-2xl font-bold text-mira-text">Демо-вход</h1>
          <p className="mt-1 text-sm text-mira-muted">Тестовые аккаунты для проверки приложения</p>
        </div>

        {/* Login form */}
        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-lg font-bold text-mira-text">Войти</h2>
          <div className="space-y-3">
            <input type="email" value={login} onChange={e => { setLogin(e.target.value); setError(""); }}
              placeholder="Email" className="w-full rounded-2xl border border-mira-lavender/30 bg-mira-bg px-4 py-3 text-sm text-mira-text placeholder:text-mira-muted focus:border-mira-primary focus:outline-none" />
            <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
              placeholder="Пароль" className="w-full rounded-2xl border border-mira-lavender/30 bg-mira-bg px-4 py-3 text-sm text-mira-text placeholder:text-mira-muted focus:border-mira-primary focus:outline-none" />
            {error && <p className="text-xs text-[#C47E9B]">{error}</p>}
            <Button className="w-full" onClick={handleLogin}>Войти</Button>
          </div>
        </Card>

        {/* Quick access */}
        <h2 className="mb-3 text-lg font-bold text-mira-text">Быстрый вход</h2>
        <div className="space-y-3">
          {users.map(user => (
            <Card key={user.login} className="cursor-pointer p-4 transition hover:shadow-soft" onClick={() => quickLogin(user)}>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mira-rose-light to-mira-lavender-light text-lg font-bold text-mira-primary">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-mira-text">{user.name}</p>
                  <p className="text-xs text-mira-muted">{user.description}</p>
                  <p className="mt-1 text-[10px] text-mira-primary">{user.login} · {user.password}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-mira-muted">
          <a href="/" className="text-mira-primary hover:underline">← Вернуться к приложению</a>
        </p>
      </div>
    </div>
  );
}
