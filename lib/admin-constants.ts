export const ADMIN_PROFILE = {
  name: 'Hà Thị Thanh',
  avatar: 'HT',
  email: 'admin@gmail.com',
  role: 'Quản trị viên hệ thống (Super Admin)',
  joinedAt: 'Tháng 8, 2026',
} as const

export const QUIZ_CATEGORY_SLUGS = [
  { value: 'trac-nghiem-10', label: 'Ôn thi vào lớp 10' },
  { value: 'trac-nghiem-9', label: 'Trắc nghiệm Ngữ Văn 9' },
  { value: 'trac-nghiem-8', label: 'Trắc nghiệm Ngữ Văn 8' },
  { value: 'trac-nghiem-7', label: 'Trắc nghiệm Ngữ Văn 7' },
  { value: 'trac-nghiem-6', label: 'Trắc nghiệm Ngữ Văn 6' },
] as const

export function getCategoryTitle(slug: string): string {
  const map: Record<string, string> = {
    'on-thi-10': 'Góc Ôn Thi Vào Lớp 10',
    'trac-nghiem-10': 'Phần Trắc Nghiệm Vào Lớp 10',
    'trac-nghiem-9': 'Trắc Nghiệm Ngữ Văn 9',
    'trac-nghiem-8': 'Trắc Nghiệm Ngữ Văn 8',
    'trac-nghiem-7': 'Trắc Nghiệm Ngữ Văn 7',
    'trac-nghiem-6': 'Trắc Nghiệm Ngữ Văn 6',
    'de-thi-10': 'Đề Thi Mẫu Vào Lớp 10',
    'bi-kip': 'Bí Kíp Đạt Điểm Cao',
  }
  return map[slug] || `Danh mục: ${slug}`
}

export function isQuizCategory(slug: string): boolean {
  return slug.startsWith('trac-nghiem-')
}
