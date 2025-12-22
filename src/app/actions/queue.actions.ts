'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { isTokenExpired } from '@/lib/checkToken';

const API_BASE = process.env.BACKEND_URL;

async function getSessionAndHeaders() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken || isTokenExpired(session.accessToken)) {
    throw new Error('Unauthorized');
  }

  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
    },
  };
}

async function getDoctorQueue() {
  try {
    const { headers } = await getSessionAndHeaders();

    const res = await fetch(`${API_BASE}/queue`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch queue: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    throw new Error(`Error fetching queue: ${error}`);
  }
}

async function startConsultation(payload: {
  patientId: string;
  visitId: string;
}) {
  try {
    const { headers } = await getSessionAndHeaders();

    const res = await fetch(`${API_BASE}/queue/start-consultation`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // Try to parse error message from backend
      let errorMessage = res.statusText;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error(`${error}`);
  }
}

export { getDoctorQueue, startConsultation };
