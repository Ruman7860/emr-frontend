import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { isTokenExpired } from '@/lib/checkToken';
import { Suspense } from 'react';
import CustomSkeleton from '@/components/custom/skeleton/custom-skeleton';
import StaffClient from '@/components/custom/staffs/staff-client';
import { getStaffs } from '@/app/actions/staffs/staffs.actions';

const page = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || isTokenExpired(session.accessToken)) {
    redirect("/login");
  }
  if (!session) redirect('/login');

  const allStaffs = await getStaffs();
  const initialStaffs = allStaffs.data.map((doc: any) => ({
    id: doc.id,
    name: doc.user.name,
    email: doc.user.email,
    phone: doc.phone,
    employeeCode: doc.employeeCode,
    isActive: doc.isActive,
    deletedAt: doc.deletedAt
  }));
  return (
    <Suspense fallback={<CustomSkeleton />}>
      <StaffClient initialStaffs = {initialStaffs} />
    </Suspense>
  )
}

export default page