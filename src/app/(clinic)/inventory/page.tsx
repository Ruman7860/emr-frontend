import InventoryClient from '@/components/custom/inventory/InventoryClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { isTokenExpired } from '@/lib/checkToken';

export default async function InventoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');
  
  if (!session?.accessToken || isTokenExpired(session.accessToken)) {
    redirect("/login");
  }

  const inventoryPromise = fetch(`${process.env.BACKEND_URL}/inventory`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  }).then(res => res.json());;


  return <InventoryClient initialInventory={await inventoryPromise} />;
}
