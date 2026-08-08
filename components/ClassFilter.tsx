'use client'

interface ClassFilterProps {
  selectedClasses: string[]
  onClassChange: (classes: string[]) => void
}

const CLASS_OPTIONS = [
  { id: 'all', label: 'Tất cả' },
  { id: '6', label: 'Lớp 6' },
  { id: '7', label: 'Lớp 7' },
  { id: '8', label: 'Lớp 8' },
  { id: '9', label: 'Lớp 9' },
]

export default function ClassFilter({ selectedClasses, onClassChange }: ClassFilterProps) {
  const handleClassToggle = (classId: string) => {
    if (classId === 'all') {
      onClassChange(selectedClasses.length === 4 ? [] : ['6', '7', '8', '9'])
    } else {
      const newClasses = selectedClasses.includes(classId)
        ? selectedClasses.filter(c => c !== classId)
        : [...selectedClasses, classId]
      onClassChange(newClasses)
    }
  }

  const isAllSelected = selectedClasses.length === 4
  const isNoneSelected = selectedClasses.length === 0

  return (
    <div className="bg-white rounded-lg p-4 border border-border shadow-sm">
      <h3 className="font-semibold text-foreground mb-3 flex items-center">
        <span className="w-3 h-3 rounded-full bg-primary mr-2"></span>
        Lớp
      </h3>
      <div className="space-y-2">
        {CLASS_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => handleClassToggle(option.id)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all ${
              option.id === 'all'
                ? isNoneSelected
                  ? 'bg-primary text-primary-foreground'
                  : isAllSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-secondary'
                : selectedClasses.includes(option.id)
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
