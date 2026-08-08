'use client'

interface CategoryFilterProps {
  selectedCategories: string[]
  onCategoryChange: (categories: string[]) => void
}

const CATEGORY_OPTIONS = [
  { id: 'biểu cảm', label: 'Văn biểu cảm' },
  { id: 'tự sự', label: 'Văn tự sự' },
  { id: 'thuyết minh', label: 'Văn thuyết minh' },
  { id: 'nghị luận', label: 'Văn nghị luận' },
  { id: 'phân tích', label: 'Phân tích tác phẩm' },
]

export default function CategoryFilter({ selectedCategories, onCategoryChange }: CategoryFilterProps) {
  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(c => c !== categoryId)
      : [...selectedCategories, categoryId]
    onCategoryChange(newCategories)
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-border shadow-sm mt-4">
      <h3 className="font-semibold text-foreground mb-3 flex items-center">
        <span className="w-3 h-3 rounded-full bg-accent mr-2"></span>
        Thể loại
      </h3>
      <div className="space-y-2">
        {CATEGORY_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => handleCategoryToggle(option.id)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all ${
              selectedCategories.includes(option.id)
                ? 'bg-accent text-accent-foreground'
                : 'bg-secondary text-foreground hover:bg-secondary'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
