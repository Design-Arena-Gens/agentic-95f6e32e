export const CATEGORIES = [
  { key: 'TECH', label: 'Tech' },
  { key: 'LIFE', label: 'Life' },
  { key: 'CAREER', label: 'Career' },
  { key: 'RELATIONSHIP', label: 'Relationship' },
  { key: 'STUDY', label: 'Study' },
  { key: 'BUSINESS', label: 'Business' },
  { key: 'EMOTIONAL', label: 'Emotional' },
  { key: 'OTHER', label: 'Other' },
] as const;

export type CategoryKey = typeof CATEGORIES[number]['key'];
