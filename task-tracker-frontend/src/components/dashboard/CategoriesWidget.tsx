'use client';

interface CategoryItem {
  id: number | string;
  name: string;
  count?: number;
}

export function CategoriesWidget({
  categories = [],
  onAddClick,
}: {
  categories?: { id: number; name: string }[];
  onAddClick?: () => void;
}) {
  const presetCategories: CategoryItem[] = [
    { id: 'work', name: 'Product Engineering', count: 12 },
    { id: 'marketing', name: 'Marketing & Growth', count: 6 },
    { id: 'operations', name: 'Operations & Legal', count: 4 },
    { id: 'design', name: 'Design System', count: 8 },
  ];

  const displayItems = categories.length > 0
    ? categories.map((cat, idx) => ({
        id: cat.id,
        name: cat.name,
        count: (idx + 1) * 3,
      }))
    : presetCategories;

  return (
    <div className="organizo-card p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-[var(--text-main)]">Categories & Teams</h3>
        <span className="text-xs text-[var(--text-subtle)]">{displayItems.length} active</span>
      </div>

      <div className="space-y-2.5">
        {displayItems.slice(0, 4).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--canvas-bg)] hover:border-[var(--text-muted)] transition-colors"
          >
            <span className="text-xs font-semibold text-[var(--text-main)] truncate">
              {item.name}
            </span>
            <span className="pill-badge pill-medium text-[0.65rem] py-0.5 px-2">
              {item.count} tasks
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--card-border)]">
        <button
          onClick={onAddClick}
          className="text-xs font-semibold text-[var(--text-main)] hover:underline flex items-center gap-1.5 transition-colors"
        >
          <span>+</span>
          <span>Add new category</span>
        </button>
      </div>
    </div>
  );
}
