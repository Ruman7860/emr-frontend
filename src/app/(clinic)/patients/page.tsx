import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { isTokenExpired } from '@/lib/checkToken';
import { Suspense } from 'react';
import CustomSkeleton from '@/components/custom/skeleton/custom-skeleton';
import { getPatients } from '@/app/actions/patients.actions';
import PatientClient from '@/components/custom/patients/patients-client';
import { getDoctors } from '@/app/actions/doctors/doctors.actions';

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    deleted?: string;
  }>;
}) => {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');

  if (!session?.accessToken || isTokenExpired(session.accessToken)) {
    redirect('/login');
  }

  const resolvedSearchParams = await searchParams;
  const pageNum = parseInt(resolvedSearchParams.page || '1', 10);
  const limitNum = parseInt(resolvedSearchParams.limit || '10', 10);
  const search = resolvedSearchParams.search || undefined;
  const deleted = resolvedSearchParams.deleted === 'true';

  const patientsData = await getPatients(pageNum, limitNum, search, deleted);
  const doctorData = await getDoctors();

  if (!patientsData.success) {
    console.error('Error fetching patients:', patientsData.message);
    return <div>Error: {patientsData.message}</div>;
  }
  
  const initialPatients = patientsData.data.patients.map((patient: any) => ({
    id: patient.id,
    fullName: patient.fullName,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender,
    address: patient.address,
    age: patient.age,
    phone: patient.phone,
    patientNumber: patient.patientNumber,
    doctorId: patient.doctorId,
    registrationFee: patient.registrationFee,
    visitStatus: patient.visitStatus,
    isActive: !patient.deletedAt && patient.status === 'ACTIVE',
    deletedAt: patient.deletedAt,
  }));

  const initialDoctorData = doctorData.data.map((doctor:any) => ({
    id: doctor.id,
    fullName: doctor.user.name,
  }))

  return (
    <Suspense fallback={<CustomSkeleton />}>
      <PatientClient
        initialData={{
          patients: initialPatients,
          total: patientsData.data.total,
          page: patientsData.data.page,
          limit: patientsData.data.limit,
          totalPages: patientsData.data.totalPages,
        }}
        initialDoctorData = {initialDoctorData}
      />
    </Suspense>
  );
};

export default page;