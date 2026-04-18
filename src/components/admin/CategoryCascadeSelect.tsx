'use client';

import { useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

interface Props {
  value: string;
  onChange: (categoryId: string) => void;
  selectClass?: string;
}

export function CategoryCascadeSelect({ value, onChange, selectClass = '' }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedParentId, setSelectedParentId] = useState('');
  const [selectedSubId, setSelectedSubId] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data: Category[]) => {
        setCategories(data);

        // If a value is pre-set, figure out parent + sub
        if (value) {
          const cat = data.find((c) => c.id === parseInt(value));
          if (cat) {
            if (cat.parentId === null) {
              // It's a top-level cat
              setSelectedParentId(String(cat.id));
              setSelectedSubId('');
            } else {
              // It's a subcategory
              setSelectedParentId(String(cat.parentId));
              setSelectedSubId(String(cat.id));
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  // Separate effect to handle value changes from outside (e.g. edit form loading)
  useEffect(() => {
    if (!value || categories.length === 0) return;
    const cat = categories.find((c) => c.id === parseInt(value));
    if (cat) {
      if (cat.parentId === null) {
        setSelectedParentId(String(cat.id));
        setSelectedSubId('');
      } else {
        setSelectedParentId(String(cat.parentId));
        setSelectedSubId(String(cat.id));
      }
    }
  }, [value, categories]);

  const parents = categories.filter((c) => c.parentId === null);
  const subcategories = selectedParentId
    ? categories.filter((c) => c.parentId === parseInt(selectedParentId))
    : [];

  function handleParentChange(parentId: string) {
    setSelectedParentId(parentId);
    setSelectedSubId('');
    onChange(parentId);
  }

  function handleSubChange(subId: string) {
    setSelectedSubId(subId);
    onChange(subId || selectedParentId);
  }

  return (
    <div className="space-y-2">
      {/* Parent Category */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Parent Category</label>
        <select
          value={selectedParentId}
          onChange={(e) => handleParentChange(e.target.value)}
          className={selectClass}
        >
          <option value="">— Select category —</option>
          {parents.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Subcategory — only shown when parent is selected */}
      {selectedParentId && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Subcategory
            <span className="ml-1 text-gray-400 font-normal">(optional — leave blank to use parent)</span>
          </label>
          {subcategories.length > 0 ? (
            <select
              value={selectedSubId}
              onChange={(e) => handleSubChange(e.target.value)}
              className={selectClass}
            >
              <option value="">— All subcategories —</option>
              {subcategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-gray-400 italic py-1">No subcategories — product will be placed directly in the parent category.</p>
          )}
        </div>
      )}

      {/* Breadcrumb hint */}
      {selectedParentId && (
        <p className="text-xs text-[#003DA5]">
          {(() => {
            const parent = categories.find((c) => c.id === parseInt(selectedParentId));
            const sub = selectedSubId ? categories.find((c) => c.id === parseInt(selectedSubId)) : null;
            return sub
              ? `📂 ${parent?.name} → ${sub.name}`
              : `📂 ${parent?.name}`;
          })()}
        </p>
      )}
    </div>
  );
}
