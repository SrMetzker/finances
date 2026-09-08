'use client';

import { FormEvent, useEffect, useState } from 'react';
import { BellRing, Loader2, Save } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { apiClient } from '@/services/api.client';
import type { FinancialHealthNotificationPreference } from '@/services/api.types';
import { notify } from '@/services/toast';

const WEEKDAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

function browserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid';
}

const DEFAULT_PREFERENCE: FinancialHealthNotificationPreference = {
  enabled: false, frequency: 'WEEKLY', weekday: 1, dayOfMonth: 1, time: '09:00', timezone: 'Europe/Madrid',
};

export default function NotificationSettingsPage() {
  const [preference, setPreference] = useState<FinancialHealthNotificationPreference>(DEFAULT_PREFERENCE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiClient.getFinancialHealthNotificationPreference()
      .then((saved) => setPreference({ ...saved, timezone: saved.timezone || browserTimezone() }))
      .catch((error) => notify.error(error, 'Não foi possível carregar suas notificações.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function requestBrowserPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') await Notification.requestPermission();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      if (preference.enabled) await requestBrowserPermission();
      await apiClient.updateFinancialHealthNotificationPreference({ ...preference, timezone: browserTimezone() });
      notify.success('Preferências de notificação salvas.');
    } catch (error) {
      notify.error(error, 'Não foi possível salvar suas notificações.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageShell title="Notificações" backHref="/settings">
      <div className="mx-4 my-4 pb-6">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-lime-300" /></div>
        ) : (
          <form onSubmit={(event) => { void handleSubmit(event); }} className="space-y-4">
            <section className="brand-surface rounded-[1.75rem] p-4">
              <div className="flex items-start gap-3">
                <div className="brand-gradient-soft flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"><BellRing size={19} className="text-lime-300" /></div>
                <div><h2 className="text-sm font-semibold text-zinc-100">Saúde financeira</h2><p className="mt-1 text-xs leading-5 text-zinc-400">Receba um lembrete para conferir receitas, despesas e saldo nos gráficos.</p></div>
              </div>
              <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl border border-white/8 px-3 py-3">
                <span className="text-sm text-zinc-100">Ativar lembrete</span>
                <input type="checkbox" checked={preference.enabled} onChange={(event) => setPreference({ ...preference, enabled: event.target.checked })} className="h-4 w-4 accent-lime-300" />
              </label>
            </section>

            <section className={`brand-surface space-y-4 rounded-[1.75rem] p-4 ${preference.enabled ? '' : 'opacity-50'}`}>
              <fieldset disabled={!preference.enabled} className="space-y-4">
                <div><label className="mb-1 block text-xs text-zinc-400">Frequência</label><select value={preference.frequency} onChange={(event) => setPreference({ ...preference, frequency: event.target.value as FinancialHealthNotificationPreference['frequency'] })} className="brand-panel w-full rounded-2xl border border-white/8 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-lime-300"><option value="WEEKLY">Semanal</option><option value="MONTHLY">Mensal</option></select></div>
                {preference.frequency === 'WEEKLY' ? <div><label className="mb-1 block text-xs text-zinc-400">Melhor dia</label><select value={preference.weekday} onChange={(event) => setPreference({ ...preference, weekday: Number(event.target.value) })} className="brand-panel w-full rounded-2xl border border-white/8 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-lime-300">{WEEKDAYS.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></div> : <div><label className="mb-1 block text-xs text-zinc-400">Dia do mês</label><select value={preference.dayOfMonth} onChange={(event) => setPreference({ ...preference, dayOfMonth: Number(event.target.value) })} className="brand-panel w-full rounded-2xl border border-white/8 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-lime-300">{Array.from({ length: 31 }, (_, index) => <option key={index + 1} value={index + 1}>Dia {index + 1}</option>)}</select></div>}
                <div><label className="mb-1 block text-xs text-zinc-400">Horário</label><input type="time" value={preference.time} onChange={(event) => setPreference({ ...preference, time: event.target.value })} className="brand-panel w-full rounded-2xl border border-white/8 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-lime-300" /></div>
              </fieldset>
              <p className="text-xs leading-5 text-zinc-500">O horário usa o fuso do seu dispositivo. Ao tocar no lembrete, os Gráficos serão abertos.</p>
            </section>
            <button type="submit" disabled={isSaving} className="brand-gradient inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60"><>{isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}</>Salvar notificações</button>
          </form>
        )}
      </div>
    </PageShell>
  );
}
