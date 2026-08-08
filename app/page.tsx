import { redirect } from 'next/navigation';

export default function Home() {
  // Tự động chuyển hướng ngay lập tức sang trang /login
  redirect('/login');
}