import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import PatientsClient from '@/components/custom/patients/Patients';
import React from 'react';
import { isTokenExpired } from '@/lib/checkToken';

export default async function PatientsPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');
  
  if (!session?.accessToken || isTokenExpired(session.accessToken)) {
    redirect("/login");
  }

  const patientsPromise = fetch(`${process.env.BACKEND_URL}/patients`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  }).then(res => res.json());

  return (
    <React.Suspense fallback={<p>Loading patients...</p>}>
      <PatientsClient patients={await patientsPromise} />
    </React.Suspense>
  );
}