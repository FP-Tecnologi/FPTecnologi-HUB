import { redirect } from 'next/navigation';

/* Los recursos viven dentro de la intranet de socios. */
export default function RecursosPage() {
  redirect('/socios');
}
