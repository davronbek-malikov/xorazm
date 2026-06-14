"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DEMO_ACCOUNTS = [
  { username: "admin", password: "admin123", role: "Administrator" },
  { username: "direktor", password: "direktor123", role: "Direktor" },
  { username: "kassir", password: "kassir123", role: "Kassir" },
  { username: "omborchi", password: "omborchi123", role: "Omborchi" },
  { username: "buxgalter", password: "buxgalter123", role: "Buxgalter" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const session = login(username, password);
    if (!session) {
      setError("Login yoki parol noto'g'ri");
      return;
    }
    router.push("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Xorazm ERP — Tizimga kirish</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-gray-600">Login</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">Parol</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full">
                Kirish
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demo hisoblar</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-gray-600">
              {DEMO_ACCOUNTS.map((acc) => (
                <li key={acc.username}>
                  <span className="font-medium text-gray-800">{acc.username}</span> / {acc.password} — {acc.role}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
