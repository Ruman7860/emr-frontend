// app/[path]/page.tsx (update your existing Page component)
// No changes needed to imports unless adding new ones.
// Pass the data to the client component.

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { isTokenExpired } from '@/lib/checkToken';
import { Suspense } from 'react';
import CustomSkeleton from '@/components/custom/skeleton/custom-skeleton';
import { getTimelinePatientData } from '@/app/actions/patients.actions';
import PatientTimeLineViewClient from '@/components/custom/patients/patient-timeline-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');

  if (!session?.accessToken || isTokenExpired(session.accessToken)) {
    redirect('/login');
  }

  const { id: patientId } = await params;

  const timeLinePatient = await getTimelinePatientData(patientId);

  return (
    <Suspense fallback={<CustomSkeleton />}>
      <PatientTimeLineViewClient data={timeLinePatient.data} />
    </Suspense>
  )
}

export default Page