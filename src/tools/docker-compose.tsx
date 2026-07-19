import { dump } from 'js-yaml';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

interface Port { host: string; container: string }
interface EnvVar { key: string; value: string }

interface Service {
  id: number;
  name: string;
  image: string;
  ports: Port[];
  env: EnvVar[];
  volumes: string[];
  restart: string;
}

let counter = 0;
const nextId = () => { counter += 1; return counter; };

function emptyService(name: string, image: string): Service {
  return { id: nextId(), name, image, ports: [], env: [], volumes: [], restart: 'unless-stopped' };
}

function buildCompose(services: Service[], version: string): string {
  const map: Record<string, unknown> = {};
  for (const service of services) {
    if (!service.name.trim()) continue;
    const entry: Record<string, unknown> = {};
    if (service.image.trim()) entry.image = service.image.trim();
    const ports = service.ports.filter((p) => p.host.trim() && p.container.trim()).map((p) => `${p.host.trim()}:${p.container.trim()}`);
    if (ports.length) entry.ports = ports;
    const env = service.env.filter((e) => e.key.trim());
    if (env.length) entry.environment = Object.fromEntries(env.map((e) => [e.key.trim(), e.value]));
    const volumes = service.volumes.filter((v) => v.trim()).map((v) => v.trim());
    if (volumes.length) entry.volumes = volumes;
    if (service.restart && service.restart !== 'no') entry.restart = service.restart;
    map[service.name.trim()] = entry;
  }
  const doc: Record<string, unknown> = { services: map };
  if (version.trim()) doc.version = version.trim();
  return dump(doc, { indent: 2, lineWidth: -1, sortKeys: false });
}

const RESTART_OPTIONS = ['no', 'always', 'on-failure', 'unless-stopped'];

const DockerComposeTool = memo(function DockerComposeTool() {
  const { t } = useTranslation();
  const [version, setVersion] = useState('3.9');
  const [services, setServices] = useState<Service[]>(() => {
    const web = emptyService('web', 'nginx:alpine');
    web.ports = [{ host: '8080', container: '80' }];
    return [web];
  });

  const yaml = useMemo(() => buildCompose(services, version), [services, version]);

  const patch = (id: number, update: Partial<Service>) =>
    setServices((current) => current.map((s) => (s.id === id ? { ...s, ...update } : s)));

  return (
    <ToolLayout id="docker-compose" color="#22d3ee">
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="block text-sm text-[var(--color-text-muted)]">
          {t('tools.docker-compose.version')}
          <GlassInput aria-label={t('tools.docker-compose.version')} value={version} onChange={(event) => setVersion(event.target.value)} className="mt-2 w-32" placeholder="3.9" />
        </label>
        <GlassButton onClick={() => setServices((current) => [...current, emptyService(`service${current.length + 1}`, 'alpine:latest')])}>
          <Plus size={16} /> {t('tools.docker-compose.addService')}
        </GlassButton>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="glass-input space-y-3 p-4">
              <div className="flex items-center gap-2">
                <GlassInput aria-label={t('tools.docker-compose.serviceName')} value={service.name} onChange={(event) => patch(service.id, { name: event.target.value })} placeholder={t('tools.docker-compose.serviceName')} />
                <button type="button" aria-label={t('tools.docker-compose.removeService')} className="glass-button shrink-0 px-2" onClick={() => setServices((current) => current.filter((s) => s.id !== service.id))}>
                  <Trash2 size={16} />
                </button>
              </div>
              <GlassInput aria-label={t('tools.docker-compose.image')} value={service.image} onChange={(event) => patch(service.id, { image: event.target.value })} placeholder="nginx:alpine" />

              <div>
                <div className="mb-1 flex items-center justify-between text-sm text-[var(--color-text-muted)]">
                  <span>{t('tools.docker-compose.ports')}</span>
                  <button type="button" className="glass-button px-2 py-1 text-xs" onClick={() => patch(service.id, { ports: [...service.ports, { host: '', container: '' }] })}>+ {t('tools.docker-compose.add')}</button>
                </div>
                {service.ports.map((port, index) => (
                  <div key={index} className="mb-2 flex items-center gap-2">
                    <GlassInput aria-label="host" value={port.host} onChange={(event) => patch(service.id, { ports: service.ports.map((p, i) => (i === index ? { ...p, host: event.target.value } : p)) })} placeholder="8080" />
                    <span className="text-[var(--color-text-muted)]">:</span>
                    <GlassInput aria-label="container" value={port.container} onChange={(event) => patch(service.id, { ports: service.ports.map((p, i) => (i === index ? { ...p, container: event.target.value } : p)) })} placeholder="80" />
                    <button type="button" aria-label={t('tools.docker-compose.remove')} className="glass-button shrink-0 px-2" onClick={() => patch(service.id, { ports: service.ports.filter((_, i) => i !== index) })}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-sm text-[var(--color-text-muted)]">
                  <span>{t('tools.docker-compose.environment')}</span>
                  <button type="button" className="glass-button px-2 py-1 text-xs" onClick={() => patch(service.id, { env: [...service.env, { key: '', value: '' }] })}>+ {t('tools.docker-compose.add')}</button>
                </div>
                {service.env.map((env, index) => (
                  <div key={index} className="mb-2 flex items-center gap-2">
                    <GlassInput aria-label="key" value={env.key} onChange={(event) => patch(service.id, { env: service.env.map((e, i) => (i === index ? { ...e, key: event.target.value } : e)) })} placeholder="KEY" />
                    <span className="text-[var(--color-text-muted)]">=</span>
                    <GlassInput aria-label="value" value={env.value} onChange={(event) => patch(service.id, { env: service.env.map((e, i) => (i === index ? { ...e, value: event.target.value } : e)) })} placeholder="value" />
                    <button type="button" aria-label={t('tools.docker-compose.remove')} className="glass-button shrink-0 px-2" onClick={() => patch(service.id, { env: service.env.filter((_, i) => i !== index) })}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-sm text-[var(--color-text-muted)]">
                  <span>{t('tools.docker-compose.volumes')}</span>
                  <button type="button" className="glass-button px-2 py-1 text-xs" onClick={() => patch(service.id, { volumes: [...service.volumes, ''] })}>+ {t('tools.docker-compose.add')}</button>
                </div>
                {service.volumes.map((volume, index) => (
                  <div key={index} className="mb-2 flex items-center gap-2">
                    <GlassInput aria-label="volume" value={volume} onChange={(event) => patch(service.id, { volumes: service.volumes.map((v, i) => (i === index ? event.target.value : v)) })} placeholder="./data:/var/lib/data" />
                    <button type="button" aria-label={t('tools.docker-compose.remove')} className="glass-button shrink-0 px-2" onClick={() => patch(service.id, { volumes: service.volumes.filter((_, i) => i !== index) })}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              <label className="flex items-center gap-3 text-sm">
                <span className="text-[var(--color-text-muted)]">{t('tools.docker-compose.restart')}</span>
                <select className="glass-select" value={service.restart} onChange={(event) => patch(service.id, { restart: event.target.value })} aria-label={t('tools.docker-compose.restart')}>
                  {RESTART_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            </div>
          ))}
          {services.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">{t('tools.docker-compose.empty')}</p>}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">docker-compose.yml</h2>
            <CopyButton value={yaml} />
          </div>
          <pre className="mono-panel max-h-[40rem] overflow-auto px-4 py-3 font-mono text-sm whitespace-pre">{yaml}</pre>
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.docker-compose.hint')}</p>
    </ToolLayout>
  );
});

export default DockerComposeTool;
