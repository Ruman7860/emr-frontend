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

// Validate prescription data
function validatePrescriptionData(data: any) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid input: Prescription data must be an object');
    }
    if (!data.visitId || typeof data.visitId !== 'string' || data.visitId.trim() === '') {
        throw new Error('Invalid input: Visit ID is required and must be a non-empty string');
    }
    if (!data.patientId || typeof data.patientId !== 'string' || data.patientId.trim() === '') {
        throw new Error('Invalid input: Patient ID is required and must be a non-empty string');
    }
    if (!Array.isArray(data.medications) || data.medications.length === 0) {
        throw new Error('Invalid input: Medications must be a non-empty array');
    }
    // Validate each medication
    data.medications.forEach((med: any, index: number) => {
        if (!med.drugName || typeof med.drugName !== 'string' || med.drugName.trim() === '') {
            throw new Error(`Invalid input: Medication ${index + 1} must have a drug name`);
        }
        if (!med.dosage || typeof med.dosage !== 'string' || med.dosage.trim() === '') {
            throw new Error(`Invalid input: Medication ${index + 1} must have a dosage`);
        }
    });
}

async function getPrescriptionsByVisit(visitId: string) {
    try {
        validateId(visitId);
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/prescriptions?visitId=${visitId}`, {
            headers,
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch prescriptions: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        throw new Error(`Error fetching prescriptions: ${error}`);
    }
}

async function getPrescriptionById(id: string) {
    try {
        validateId(id);
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/prescriptions/${id}`, {
            headers,
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch prescription: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        throw new Error(`Error fetching prescription: ${error}`);
    }
}

async function createPrescription(data: any) {
    try {
        validatePrescriptionData(data);
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/prescriptions`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error(`Failed to create prescription: ${res.status} ${res.statusText}`);
        }

        const createdPrescription = await res.json();
        revalidatePath(`/consultation/${data.patientId}`);
        return createdPrescription;
    } catch (error) {
        throw new Error(`Error creating prescription: ${error}`);
    }
}

async function updatePrescription(id: string, data: any) {
    try {
        validateId(id);
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid input: Update data must be an object');
        }
        if (data.medications && (!Array.isArray(data.medications) || data.medications.length === 0)) {
            throw new Error('Invalid input: Medications must be a non-empty array if provided');
        }

        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/prescriptions/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error(`Failed to update prescription: ${res.status} ${res.statusText}`);
        }

        const updatedPrescription = await res.json();
        return updatedPrescription;
    } catch (error) {
        throw new Error(`Error updating prescription: ${error}`);
    }
}

async function deletePrescription(id: string) {
    try {
        validateId(id);
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/prescriptions/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (!res.ok) {
            throw new Error(`Failed to delete prescription: ${res.status} ${res.statusText}`);
        }

        const responseData = await res.json();
        return {
            success: responseData.success ?? true,
            message: responseData.message || 'Prescription deleted successfully',
        };
    } catch (error) {
        throw new Error(`Error deleting prescription: ${error}`);
    }
}

async function getPrescriptionDocumentsByPatient(patientId: string) {
    try {
        validateId(patientId);
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/prescriptions/documents/patient/${patientId}`, {
            headers,
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch prescription documents: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        throw new Error(`Error fetching prescription documents: ${error}`);
    }
}

async function getDocumentDownloadUrl(documentId: string) {
    try {
        validateId(documentId);
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/prescriptions/documents/${documentId}/download`, {
            headers,
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to get download URL: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        throw new Error(`Error getting download URL: ${error}`);
    }
}

export {
    getPrescriptionsByVisit,
    getPrescriptionById,
    createPrescription,
    updatePrescription,
    deletePrescription,
    getPrescriptionDocumentsByPatient,
    getDocumentDownloadUrl,
};
