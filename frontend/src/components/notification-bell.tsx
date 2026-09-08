'use client';

import Link from 'next/link';
import { Bell, BellRing, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/services/api.client';
import type { NotificationItem } from '@/services/api.types';
import { useAuth } from '@/services/auth.context';
import { notify } from '@/services/toast';

const POLL_INTERVAL = 30_000;

export function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const announcedIds = useRef(new Set<string>());

  useEffect(() => {
    if (!user) return;
    const announcedStorageKey = `finances:announced-notifications:${user.id}`;
    try {
      const storedIds = JSON.parse(sessionStorage.getItem(announcedStorageKey) ?? '[]');
      if (Array.isArray(storedIds)) {
        announcedIds.current = new Set(storedIds.filter((id): id is string => typeof id === 'string'));
      }
    } catch {
      announcedIds.current = new Set<string>();
    }
    let active = true;

    const load = async () => {
      try {
        const notifications = await apiClient.getNotifications();
        if (!active) return;
        setItems(notifications);
        notifications.filter((item) => !item.readAt).forEach((item) => {
          if (announcedIds.current.has(item.id)) return;
          announcedIds.current.add(item.id);
          // The in-app toast is independent from the browser permission and is
          // therefore the reliable feedback while the application is open.
          notify.info(item.title, item.body);
          if ('Notification' in window && Notification.permission === 'granted') {
            const browserNotification = new Notification(item.title, { body: item.body });
            browserNotification.onclick = () => { window.focus(); window.location.assign(item.href); };
          }
        });
        sessionStorage.setItem(
          announcedStorageKey,
          JSON.stringify([...announcedIds.current].slice(-100)),
        );
      } catch {
        // A falha temporária não deve interromper a navegação do usuário.
      }
    };

    void load();
    const interval = window.setInterval(() => { void load(); }, POLL_INTERVAL);
    return () => { active = false; window.clearInterval(interval); };
  }, [user]);

  const unread = items.filter((item) => !item.readAt);

  async function handleOpen(item: NotificationItem) {
    if (!item.readAt) {
      setItems((current) => current.map((candidate) => candidate.id === item.id ? { ...candidate, readAt: new Date().toISOString() } : candidate));
      try { await apiClient.markNotificationRead(item.id); } catch { /* leitura local é suficiente para este menu */ }
    }
    setIsOpen(false);
  }

  async function handleClear() {
    try {
      await apiClient.clearNotifications();
      setItems([]);
      setIsOpen(false);
    } catch (error) {
      notify.error(error, 'Não foi possível limpar as notificações.');
    }
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setIsOpen((value) => !value)} className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/6" aria-label="Abrir notificações">
        {unread.length > 0 ? <BellRing size={19} className="text-lime-300" /> : <Bell size={19} />}
        {unread.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-lime-300 ring-2 ring-[#151711]" />}
      </button>
      {isOpen && <div className="brand-surface absolute right-0 top-11 z-50 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-2xl p-1.5 shadow-2xl">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-sm font-semibold text-zinc-100">Notificações</p>
          {items.length > 0 && <button type="button" onClick={() => { void handleClear(); }} className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-red-300" aria-label="Limpar notificações" title="Limpar notificações"><Trash2 size={15} /></button>}
        </div>
        {items.length === 0 ? <p className="px-3 pb-3 text-xs text-zinc-500">Você não tem notificações por enquanto.</p> : items.map((item) => <Link key={item.id} href={item.href} onClick={() => { void handleOpen(item); }} className={`block rounded-xl px-3 py-2.5 transition-colors hover:bg-white/6 ${item.readAt ? 'text-zinc-400' : 'bg-lime-300/8 text-zinc-100'}`}><p className="text-sm font-medium">{item.title}</p><p className="mt-0.5 text-xs leading-4 text-zinc-400">{item.body}</p></Link>)}
      </div>}
    </div>
  );
}
