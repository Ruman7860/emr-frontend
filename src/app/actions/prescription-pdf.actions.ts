'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { isTokenExpired } from '@/lib/checkToken';

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

async function generatePrescriptionPDF(visitId: string, version: number = 1) {
    try {
        const { headers } = await getSessionAndHeaders();
        const res = await fetch(`${API_BASE}/prescriptions/generate-pdf`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ visitId, version }),
        });

        if (!res.ok) {
            throw new Error(`Failed to generate PDF: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        throw new Error(`Error generating prescription PDF: ${error}`);
    }
}

async function getPrescriptionDownloadUrl(documentId: string) {
    try {
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
    generatePrescriptionPDF,
    getPrescriptionDownloadUrl,
};
