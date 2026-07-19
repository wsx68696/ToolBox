import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { tools, type ToolCategory, type ToolMeta } from '../data/tools';

export interface TranslatedTool extends ToolMeta {
  name: string;
  description: string;
  keywords: string;
  categoryLabel: string;
  searchText: string;
}

const SEARCH_LANGUAGES = ['en', 'zh'] as const;

export function useTranslatedTools() {
  const { t, i18n } = useTranslation();

  return useMemo<TranslatedTool[]>(() => {
    return tools.map((tool) => {
      const searchText = SEARCH_LANGUAGES
        .flatMap((lng) => [
          i18n.getFixedT(lng)(`tools.${tool.id}.name`),
          i18n.getFixedT(lng)(`tools.${tool.id}.description`),
          i18n.getFixedT(lng)(`tools.${tool.id}.keywords`),
        ])
        .join(' ')
        .toLowerCase();
      return {
        ...tool,
        name: t(`tools.${tool.id}.name`),
        description: t(`tools.${tool.id}.description`),
        keywords: t(`tools.${tool.id}.keywords`),
        categoryLabel: t(`categories.${tool.category.toLowerCase() as Lowercase<ToolCategory>}`),
        searchText,
      };
    });
  }, [t, i18n]);
}

export function useToolCategories() {
  const { t } = useTranslation();
  return useMemo(() => {
    const categories: { key: Lowercase<ToolCategory>; label: string }[] = [
      { key: 'encode', label: t('categories.encode') },
      { key: 'format', label: t('categories.format') },
      { key: 'crypto', label: t('categories.crypto') },
      { key: 'generate', label: t('categories.generate') },
      { key: 'web', label: t('categories.web') },
      { key: 'text', label: t('categories.text') },
      { key: 'network', label: t('categories.network') },
    ];
    return categories;
  }, [t]);
}
