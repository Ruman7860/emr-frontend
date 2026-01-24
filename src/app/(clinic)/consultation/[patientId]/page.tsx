import { Suspense } from 'react';
import { getPatientById } from '@/app/actions/patients.actions';
import ConsultationClient from '@/components/custom/consultation/consultation-client';
import CustomSkeleton from '@/components/custom/skeleton/custom-skeleton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';

interface PageProps {
    params: {
        patientId: string;
    };
}

const ConsultationPage = async ({ params }: PageProps) => {
    const session = await getServerSession(authOptions);

    if (!session) redirect('/login');

    const { patientId } = await params;

    const patientDataResponse = await getPatientById(patientId);

    return (
        <Suspense fallback={<CustomSkeleton />}>
            <div className="container mx-auto p-6">
                <ConsultationClient patientData={patientDataResponse.data} />
            </div>
        </Suspense>
    );
};

export default ConsultationPage;
