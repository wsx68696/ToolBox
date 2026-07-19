import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

// A curated subset of the IEEE OUI registry (24-bit prefixes → vendor).
const OUI: Record<string, string> = {
  '000000': 'Xerox Corporation',
  '000C29': 'VMware, Inc.',
  '005056': 'VMware, Inc.',
  '000569': 'VMware, Inc.',
  '001C42': 'Parallels, Inc.',
  '080027': 'PCS Systemtechnik (VirtualBox)',
  '525400': 'QEMU / KVM (locally administered)',
  '00155D': 'Microsoft Corporation (Hyper-V)',
  '0003FF': 'Microsoft Corporation',
  '001DD8': 'Microsoft Corporation',
  '3C5AB4': 'Google, Inc.',
  'A47733': 'Google, Inc.',
  'F4F5E8': 'Google, Inc.',
  'DAA119': 'Google, Inc.',
  '001451': 'Apple, Inc.',
  '0017F2': 'Apple, Inc.',
  '3C0754': 'Apple, Inc.',
  'A85C2C': 'Apple, Inc.',
  'F0189E': 'Apple, Inc.',
  '001A11': 'Google, Inc.',
  'B827EB': 'Raspberry Pi Foundation',
  'DCA632': 'Raspberry Pi Trading Ltd',
  'E45F01': 'Raspberry Pi Trading Ltd',
  '00163E': 'Xensource, Inc.',
  '001B21': 'Intel Corporate',
  '001517': 'Intel Corporate',
  '3CFDFE': 'Intel Corporate',
  'A0A8CD': 'Intel Corporate',
  '000D3A': 'Microsoft Corporation',
  '0050F2': 'Microsoft Corporation',
  '001A2B': 'Ammasso',
  '000BDB': 'Dell Inc.',
  '00188B': 'Dell Inc.',
  'D89EF3': 'Dell Inc.',
  'F8BC12': 'Dell Inc.',
  '001E68': 'Huawei Technologies Co., Ltd',
  '00259E': 'Huawei Technologies Co., Ltd',
  '48435A': 'Huawei Technologies Co., Ltd',
  '00E04C': 'Realtek Semiconductor Corp.',
  '52544C': 'Realtek (locally administered)',
  '001CB3': 'Apple, Inc.',
  '001D0F': 'TP-Link Technologies Co., Ltd',
  '0C8063': 'TP-Link Technologies Co., Ltd',
  '50C7BF': 'TP-Link Technologies Co., Ltd',
  '001A70': 'Cisco-Linksys, LLC',
  '00040D': 'Avaya Inc.',
  '000142': 'Cisco Systems, Inc',
  '00000C': 'Cisco Systems, Inc',
  '5C5015': 'Cisco Systems, Inc',
  'D4CA6D': 'Routerboard.com (MikroTik)',
  'E48D8C': 'Routerboard.com (MikroTik)',
  '6C3B6B': 'Routerboard.com (MikroTik)',
  '001DAA': 'Samsung Electronics Co.,Ltd',
  '0021D1': 'Samsung Electronics Co.,Ltd',
  '5CF8A1': 'Samsung Electronics Co.,Ltd',
  'F0728C': 'Samsung Electronics Co.,Ltd',
  '001132': 'Synology Incorporated',
  '0011D8': 'ASUSTek COMPUTER INC.',
  '2C56DC': 'ASUSTek COMPUTER INC.',
  'D850E6': 'ASUSTek COMPUTER INC.',
};

function normalize(input: string): string {
  return input.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
}

interface Result {
  normalized: string;
  formatted: string;
  oui: string;
  vendor: string | null;
  universal: boolean;
  unicast: boolean;
}

function analyze(input: string): Result | null {
  const hex = normalize(input);
  if (hex.length < 6) return null;
  const oui = hex.slice(0, 6);
  const firstByte = parseInt(hex.slice(0, 2), 16);
  const pairs = hex.match(/.{1,2}/g) ?? [];
  return {
    normalized: hex,
    formatted: pairs.join(':'),
    oui,
    vendor: OUI[oui] ?? null,
    universal: (firstByte & 0b10) === 0,
    unicast: (firstByte & 0b1) === 0,
  };
}

const MacAddressLookupTool = memo(function MacAddressLookupTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('B8:27:EB:12:34:56');
  const result = useMemo(() => analyze(input), [input]);

  return (
    <ToolLayout id="mac-address-lookup" color="#22d3ee">
      <div className="mb-5">
        <label className="mb-2 block font-semibold" htmlFor="mac-input">{t('tools.mac-address-lookup.inputLabel')}</label>
        <GlassInput
          id="mac-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="B8:27:EB:12:34:56"
          className="font-mono"
        />
      </div>
      {result ? (
        <div className="mono-panel divide-y divide-white/5">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <span className="text-[var(--color-text-muted)]">{t('tools.mac-address-lookup.vendor')}</span>
            <span className="flex items-center gap-2">
              <span className={`font-medium ${result.vendor ? '' : 'text-[var(--color-text-muted)]'}`}>{result.vendor ?? t('tools.mac-address-lookup.unknown')}</span>
              {result.vendor && <CopyButton value={result.vendor} />}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <span className="text-[var(--color-text-muted)]">{t('tools.mac-address-lookup.oui')}</span>
            <span className="font-mono">{result.oui.match(/.{1,2}/g)?.join(':')}</span>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <span className="text-[var(--color-text-muted)]">{t('tools.mac-address-lookup.formatted')}</span>
            <span className="flex items-center gap-2 font-mono">{result.formatted}<CopyButton value={result.formatted} /></span>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <span className="text-[var(--color-text-muted)]">{t('tools.mac-address-lookup.administration')}</span>
            <span>{result.universal ? t('tools.mac-address-lookup.universal') : t('tools.mac-address-lookup.local')}</span>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <span className="text-[var(--color-text-muted)]">{t('tools.mac-address-lookup.castType')}</span>
            <span>{result.unicast ? t('tools.mac-address-lookup.unicast') : t('tools.mac-address-lookup.multicast')}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">{t('tools.mac-address-lookup.empty')}</p>
      )}
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.mac-address-lookup.hint')}</p>
    </ToolLayout>
  );
});

export default MacAddressLookupTool;
