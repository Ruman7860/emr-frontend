import { authOptions } from '@/lib/authOptions';
import { isTokenExpired } from '@/lib/checkToken';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

const page = async () => {
    const session = await getServerSession(authOptions);
    if(!session || !session?.accessToken || isTokenExpired(session.accessToken)){
        redirect("/login");
    }

    redirect('/dashboard')

}

export default page