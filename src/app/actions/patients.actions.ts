'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { isTokenExpired } from '@/lib/checkToken';
import { revalidatePath } from 'next/cache';

const API_BASE = process.env.BACKEND_URL;

async function getSessionAndHeaders() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session?.accessToken || isTokenExpired(session.accessToken)) {
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

// Basic validation for patient data
function validatePatientData(data: any, isEditing?: boolean) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid input: Patient data must be an object');
    }
    if (!data.fullName || typeof data.fullName !== 'string' || data.fullName.trim() === '') {
        throw new Error('Invalid input: Full name is required and must be a non-empty string');
    }
    if ((!data.dateOfBirth || typeof data.dateOfBirth !== 'string' || isNaN(Date.parse(data.dateOfBirth))) && !isEditing) {
        throw new Error('Invalid input: Date of birth is required and must be a valid date string');
    }
    if ((!data.gender || typeof data.gender !== 'string' || data.gender.trim() === '') && !isEditing) {
        throw new Error('Invalid input: Gender is required and must be a non-empty string');
    }
    if (data.phone && typeof data.phone === 'string' && !/^\d{10,15}$/.test(data.phone)) {
        throw new Error('Invalid input: Invalid phone format');
    }
    if ((!data.registrationFee || isNaN(Number(data.registrationFee)) || Number(data.registrationFee) <= 0) && !isEditing) {
        throw new Error('Invalid input: Registration fee is required and must be a positive number');
    }
    if (data.doctorId && typeof data.doctorId !== 'string') {
        throw new Error('Invalid input: Doctor ID must be a string if provided');
    }
}

// Validate ID
function validateId(id: string) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Invalid input: ID must be a non-empty string');
    }
}

export async function getPatients(page: number = 1, limit: number = 10, search?: string, deleted?: boolean,) {
    try {
        const { headers } = await getSessionAndHeaders();
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) queryParams.append('search', search);
        if (deleted) queryParams.append('deleted', 'true');

        const res = await fetch(`${API_BASE}/patients?${queryParams.toString()}`, { headers, cache: 'no-store' });
        if (!res.ok) {
            throw new Error(`Failed to fetch patients: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        // revalidatePath('/patients');
        return data;
    } catch (error) {
        throw new Error(`Error fetching patients: ${error}`);
    }
}

export async function createPatient(data: any) {
    try {
        validatePatientData(data);
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/patients`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            throw new Error(`Failed to create patient: ${res.status} ${res.statusText}`);
        }
        const createdPatient = await res.json();
        revalidatePath('/patients');
        return createdPatient;
    } catch (error) {
        throw new Error(`Error creating patient: ${error}`);
    }
}

export async function updatePatient(id: string, data: any, isEditing: boolean) {
    try {
        validateId(id);
        validatePatientData(data, isEditing);
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/patients/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            throw new Error(`Failed to update patient: ${res.status} ${res.statusText}`);
        }
        const updatedPatient = await res.json();
        revalidatePath('/patients');
        return updatedPatient;
    } catch (error) {
        throw new Error(`Error updating patient: ${error}`);
    }
}

export async function deletePatient(id: string) {
    try {
        validateId(id);
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/patients/${id}`, {
            method: 'DELETE',
            headers,
        });
        if (!res.ok) {
            throw new Error(`Failed to delete patient: ${res.status} ${res.statusText}`);
        }
        const responseData = await res.json();
        revalidatePath('/patients');
        return {
            success: responseData.success ?? true,
            message: responseData.message || 'Patient deleted successfully'
        }
    } catch (error) {
        throw new Error(`Error deleting patient: ${error}`);
    }
}

export async function restorePatient(id: string) {
    try {
        validateId(id);
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/patients/${id}/restore`, {
            method: 'POST',
            headers,
        });

        if (!res.ok) {
            throw new Error(`Failed to restore patient: ${res.status} ${res.statusText}`);
        }

        const restoredPatient = await res.json();
        revalidatePath('/patients'); // Refresh the patients page after restoring
        return restoredPatient;
    } catch (error) {
        throw new Error(`Error restoring patient: ${error}`);
    }
}