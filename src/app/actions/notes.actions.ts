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

async function getNotesByVisit(visitId: string) {
    try {
        validateId(visitId);
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/notes?visitId=${visitId}`, {
            headers,
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch notes: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        throw new Error(`Error fetching notes: ${error}`);
    }
}

async function updateNotes(visitId: string, notes: string, patientId?: string) {
    try {
        validateId(visitId);

        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/notes/${visitId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ notes }),
        });

        if (!res.ok) {
            throw new Error(`Failed to update notes: ${res.status} ${res.statusText}`);
        }

        const updatedNotes = await res.json();
        if (patientId) {
            revalidatePath(`/consultation/${patientId}`);
        }
        return updatedNotes;
    } catch (error) {
        throw new Error(`Error updating notes: ${error}`);
    }
}

export {
    getNotesByVisit,
    updateNotes,
};
