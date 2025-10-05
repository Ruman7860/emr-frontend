import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { isTokenExpired } from '@/lib/checkToken';
import { Suspense } from 'react';
import DoctorClient from '@/components/custom/doctors/doctor-client';
import { getDoctors } from '@/app/actions/doctors/doctors.actions';
import CustomSkeleton from '@/components/custom/skeleton/custom-skeleton';

const page = async () => {
    const session = await getServerSession(authOptions);
    
    if (!session) redirect('/login');

    if (!session?.accessToken || isTokenExpired(session.accessToken)) {
        redirect("/login");
    }

    const allDoctors = await getDoctors();
    const initialDoctors = allDoctors.data.map((doc: any) => ({
        id: doc.id,
        name: doc.user.name,
        email: doc.user.email,
        specialty: doc.specialty,
        phone: doc.phone,
        employeeCode: doc.employeeCode,
        isActive: doc.isActive,
        deletedAt: doc.deletedAt
    }));

    return (
        <Suspense fallback={<CustomSkeleton />}>
            <DoctorClient initialDoctors={initialDoctors} />
        </Suspense>
    )
}

export default page