'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { isTokenExpired } from '@/lib/checkToken';
import { revalidatePath } from 'next/cache';

const API_BASE = process.env.BACKEND_URL;

async function getSessionAndHeaders() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || isTokenExpired(session.accessToken)) {
            throw new Error('Unauthorized: Invalid or expired session');
        }
        return {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.accessToken}`,
            },
        };
    } catch (error) {
        throw new Error(`Session error: ${error}`);
    }
}

// Basic validation for doctor data
function validateDoctorData(data: any, isEditing?: boolean) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid input: Doctor data must be an object');
    }
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
        throw new Error('Invalid input: Name is required and must be a non-empty string');
    }
    if (!data.email || typeof data.email !== 'string' || data.email.trim() === '') {
        throw new Error('Invalid input: Email is required and must be a non-empty string');
    }
    if ((!data.password || typeof data.password !== 'string' || data.password.trim() === '') && !isEditing) {
        throw new Error('Invalid input: Password is required and must be a non-empty string');
    }
}

// Validate ID
function validateId(id: string) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Invalid input: ID must be a non-empty string');
    }
}

export async function getDoctors() {
    try {
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/doctors`, { headers, cache: 'no-store' });
        if (!res.ok) {
            throw new Error(`Failed to fetch doctors: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        return data;
    } catch (error) {
        throw new Error(`Error fetching doctors: ${error}`);
    }
}

export async function createDoctor(data: any) {
    try {
        validateDoctorData(data);
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/doctors`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            throw new Error(`Failed to create doctor: ${res.status} ${res.statusText}`);
        }
        const createdDoctor = await res.json();
        revalidatePath('/doctors');
        return createdDoctor;
    } catch (error) {
        throw new Error(`Error creating doctor: ${error}`);
    }
}

export async function updateDoctor(id: string, data: any, isEditing:boolean) {
    try {
        validateId(id);
        validateDoctorData(data,isEditing);
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/doctors/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            throw new Error(`Failed to update doctor: ${res.status} ${res.statusText}`);
        }
        const updatedDoctor = await res.json();
        revalidatePath('/doctors');
        return updatedDoctor;
    } catch (error) {
        throw new Error(`Error updating doctor: ${error}`);
    }
}

export async function deleteDoctor(id: string) {
    try {
        validateId(id);
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/doctors/${id}`, {
            method: 'DELETE',
            headers,
        });
        if (!res.ok) {
            throw new Error(`Failed to delete doctor: ${res.status} ${res.statusText}`);
        }
        revalidatePath('/doctors');
        return { success: true };
    } catch (error) {
        throw new Error(`Error deleting doctor: ${error}`);
    }
}

export async function restoreDoctor(id: string) {
    try {
        validateId(id); 
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/doctors/${id}/restore`, {
            method: 'PATCH',
            headers,
        });

        if (!res.ok) {
            throw new Error(`Failed to restore doctor: ${res.status} ${res.statusText}`);
        }

        const restoredDoctor = await res.json();
        revalidatePath('/doctors'); // Refresh the doctors page after restoring
        return restoredDoctor;
    } catch (error) {
        throw new Error(`Error restoring doctor: ${error}`);
    }
}
