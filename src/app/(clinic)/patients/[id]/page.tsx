import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { isTokenExpired } from '@/lib/checkToken';
import { Suspense } from 'react';
import CustomSkeleton from '@/components/custom/skeleton/custom-skeleton';
import { getPatientById } from '@/app/actions/patients.actions';
import PatientDetails from '@/components/custom/patients/patient-details';

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');

  if (!session?.accessToken || isTokenExpired(session.accessToken)) {
    redirect('/login');
  }
  const { id: patientId } = await params

  const patientsDetails = await getPatientById(patientId);
  console.log("patientDetails", patientsDetails)
  return (
    <Suspense fallback={<CustomSkeleton />}>
      <PatientDetails patientDetails={patientsDetails.data} />
    </Suspense>
  )
}

export default Page