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

// Validate ID
function validateId(id: string) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Invalid input: ID must be a non-empty string');
    }
}

async function getLabTestsByVisit(visitId: string) {
    try {
        validateId(visitId);
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/labtests?visitId=${visitId}`, {
            headers,
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch lab tests: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        throw new Error(`Error fetching lab tests: ${error}`);
    }
}

async function getLabTestById(id: string) {
    try {
        validateId(id);
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/labtests/${id}`, {
            headers,
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch lab test: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        throw new Error(`Error fetching lab test: ${error}`);
    }
}

async function createLabTest(data: any) {
    try {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid input: Lab test data must be an object');
        }
        if (!data.visitId || typeof data.visitId !== 'string' || data.visitId.trim() === '') {
            throw new Error('Invalid input: Visit ID is required');
        }
        if (!data.patientId || typeof data.patientId !== 'string' || data.patientId.trim() === '') {
            throw new Error('Invalid input: Patient ID is required');
        }
        if (!data.tests || typeof data.tests !== 'string' || data.tests.trim() === '') {
            throw new Error('Invalid input: Lab tests content is required');
        }

        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/labtests`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error(`Failed to create lab test: ${res.status} ${res.statusText}`);
        }

        const createdLabTest = await res.json();
        revalidatePath(`/consultation/${data.patientId}`);
        return createdLabTest;
    } catch (error) {
        throw new Error(`Error creating lab test: ${error}`);
    }
}

async function updateLabTest(id: string, data: any) {
    try {
        validateId(id);
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid input: Update data must be an object');
        }
        if (data.tests !== undefined && (!data.tests || typeof data.tests !== 'string' || data.tests.trim() === '')) {
            throw new Error('Invalid input: Lab tests content cannot be empty');
        }

        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/labtests/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error(`Failed to update lab test: ${res.status} ${res.statusText}`);
        }

        const updatedLabTest = await res.json();
        return updatedLabTest;
    } catch (error) {
        throw new Error(`Error updating lab test: ${error}`);
    }
}

async function deleteLabTest(id: string) {
    try {
        validateId(id);
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/labtests/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (!res.ok) {
            throw new Error(`Failed to delete lab test: ${res.status} ${res.statusText}`);
        }

        const responseData = await res.json();
        return {
            success: responseData.success ?? true,
            message: responseData.message || 'Lab test deleted successfully',
        };
    } catch (error) {
        throw new Error(`Error deleting lab test: ${error}`);
    }
}

export {
    getLabTestsByVisit,
    getLabTestById,
    createLabTest,
    updateLabTest,
    deleteLabTest,
};
