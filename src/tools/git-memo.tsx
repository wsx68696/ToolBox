import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const sections = [
  {
    title: 'sectionSetup',
    rows: [
      { cmd: 'git init', key: 'init' },
      { cmd: 'git clone <url>', key: 'clone' },
      { cmd: 'git config --global user.name "<name>"', key: 'configName' },
      { cmd: 'git config --global user.email "<email>"', key: 'configEmail' },
    ],
  },
  {
    title: 'sectionBasics',
    rows: [
      { cmd: 'git status', key: 'status' },
      { cmd: 'git add <file>', key: 'add' },
      { cmd: 'git add -p', key: 'addPatch' },
      { cmd: 'git commit -m "<message>"', key: 'commit' },
      { cmd: 'git commit --amend', key: 'amend' },
      { cmd: 'git diff', key: 'diff' },
      { cmd: 'git diff --staged', key: 'diffStaged' },
    ],
  },
  {
    title: 'sectionBranches',
    rows: [
      { cmd: 'git branch', key: 'branchList' },
      { cmd: 'git switch -c <branch>', key: 'switchCreate' },
      { cmd: 'git switch <branch>', key: 'switch' },
      { cmd: 'git merge <branch>', key: 'merge' },
      { cmd: 'git branch -d <branch>', key: 'branchDelete' },
      { cmd: 'git rebase <branch>', key: 'rebase' },
      { cmd: 'git rebase -i HEAD~<n>', key: 'rebaseInteractive' },
    ],
  },
  {
    title: 'sectionRemote',
    rows: [
      { cmd: 'git remote -v', key: 'remoteList' },
      { cmd: 'git remote add origin <url>', key: 'remoteAdd' },
      { cmd: 'git fetch', key: 'fetch' },
      { cmd: 'git pull', key: 'pull' },
      { cmd: 'git push', key: 'push' },
      { cmd: 'git push -u origin <branch>', key: 'pushUpstream' },
      { cmd: 'git push --force-with-lease', key: 'pushForce' },
    ],
  },
  {
    title: 'sectionUndo',
    rows: [
      { cmd: 'git restore <file>', key: 'restore' },
      { cmd: 'git restore --staged <file>', key: 'unstage' },
      { cmd: 'git reset --hard HEAD', key: 'resetHard' },
      { cmd: 'git reset --soft HEAD~1', key: 'resetSoft' },
      { cmd: 'git revert <commit>', key: 'revert' },
      { cmd: 'git clean -fd', key: 'clean' },
    ],
  },
  {
    title: 'sectionInspect',
    rows: [
      { cmd: 'git log --oneline --graph --all', key: 'logGraph' },
      { cmd: 'git show <commit>', key: 'show' },
      { cmd: 'git blame <file>', key: 'blame' },
      { cmd: 'git stash', key: 'stash' },
      { cmd: 'git stash pop', key: 'stashPop' },
      { cmd: 'git reflog', key: 'reflog' },
      { cmd: 'git cherry-pick <commit>', key: 'cherryPick' },
    ],
  },
] as const;

const GitMemoTool = memo(function GitMemoTool() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sections;
    return sections
      .map((section) => ({
        ...section,
        rows: section.rows.filter((row) => `${row.cmd} ${t(`tools.git-memo.${row.key}`)}`.toLowerCase().includes(term)),
      }))
      .filter((section) => section.rows.length > 0);
  }, [query, t]);

  return (
    <ToolLayout id="git-memo" color="#f87171">
      <GlassInput
        aria-label={t('tools.git-memo.search')}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('tools.git-memo.search')}
        className="mb-6"
      />
      <div className="space-y-6">
        {filtered.map((section) => (
          <div key={section.title}>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">{t(`tools.git-memo.${section.title}`)}</h2>
            <div className="mono-panel divide-y divide-white/5">
              {section.rows.map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <div className="min-w-0">
                    <code className="block truncate font-mono text-sm text-[var(--color-text)]">{row.cmd}</code>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{t(`tools.git-memo.${row.key}`)}</p>
                  </div>
                  <CopyButton value={row.cmd} />
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">{t('tools.git-memo.noResults')}</p>}
      </div>
    </ToolLayout>
  );
});

export default GitMemoTool;
