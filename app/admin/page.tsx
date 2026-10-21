import { redirect } from 'next/navigation';

/** The admin starts at the order list. */
export default function AdminHomePage() {
  redirect('/admin/orders');
}
