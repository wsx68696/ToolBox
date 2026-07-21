import { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderTree } from 'lucide-react';
import CopyButton from '../components/CopyButton';
import ToolLayout from '../components/ToolLayout';

interface TreeNode {
  name: string;
  type: 'directory' | 'file';
  children: TreeNode[];
}

function buildTree(files: FileList): TreeNode[] {
  const root: TreeNode[] = [];
  for (let i = 0; i < files.length; i += 1) {
    const path = files[i].webkitRelativePath || files[i].name;
    const segments = path.split('/').filter(Boolean);
    let level = root;
    segments.forEach((seg, idx) => {
      const isFile = idx === segments.length - 1;
      let node = level.find((n) => n.name === seg && n.type === (isFile ? 'file' : 'directory'));
      if (!node) {
        node = { name: seg, type: isFile ? 'file' : 'directory', children: [] };
        level.push(node);
      }
      level = node.children;
    });
  }
  return root;
}

function sortTree(nodes: TreeNode[]): TreeNode[] {
  return nodes
    .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'directory' ? -1 : 1))
    .map((n) => ({ ...n, children: sortTree(n.children) }));
}

function renderTree(nodes: TreeNode[], indent = ''): string {
  let out = '';
  nodes.forEach((node, i) => {
    const isLast = i === nodes.length - 1;
    out += `${indent}${isLast ? '└─ ' : '├─ '}${node.name}${node.type === 'directory' ? '/' : ''}\n`;
    if (node.children.length) out += renderTree(node.children, indent + (isLast ? '   ' : '│  '));
  });
  return out;
}

const DirTreeTool = memo(function DirTreeTool() {
  const { t } = useTranslation();
  const [tree, setTree] = useState('');
  const [rootName, setRootName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const root = files[0].webkitRelativePath.split('/')[0] || '';
    setRootName(root);
    setTree(renderTree(sortTree(buildTree(files))));
  };

  const full = rootName ? `${rootName}/\n${tree}` : tree;

  return (
    <ToolLayout id="dir-tree" color="#f472b6">
      <div className="flex flex-col gap-4">
        <button className="glass-dropzone" onClick={() => inputRef.current?.click()}>
          <FolderTree size={22} className="glass-dropzone-icon" aria-hidden="true" />
          <span className="text-sm">{t('tools.dir-tree.pick')}</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          // @ts-expect-error -- non-standard directory-picker attributes
          webkitdirectory=""
          directory=""
          multiple
          onChange={(e) => onPick(e.target.files)}
        />
        {full && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t('tools.dir-tree.output')}</h2>
              <CopyButton value={full} />
            </div>
            <pre className="mono-panel glass-card max-h-[28rem] overflow-auto p-4 text-sm">{full}</pre>
          </div>
        )}
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.dir-tree.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default DirTreeTool;
