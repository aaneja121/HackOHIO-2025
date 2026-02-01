const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const DEMO_API_KEY = 'demo-key-123'; // Matches backend default

export interface User {
    id: number;
    external_id: string;
    display_name: string;
}

export interface SymptomLog {
    id: number;
    user_id: number;
    free_text: string;
    urgency: number;
    created_at: string;
}

export const api = {
    // User Management
    createUser: async (externalId: string, displayName: string): Promise<User> => {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ external_id: externalId, display_name: displayName }),
        });
        if (!res.ok) throw new Error('Failed to create/fetch user');
        return res.json();
    },

    getUser: async (externalId: string): Promise<User> => {
        const res = await fetch(`${API_URL}/users/${externalId}`);
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
    },

    // Symptom Logs
    createLog: async (userExternalId: string, text: string, urgency: number): Promise<SymptomLog> => {
        const res = await fetch(`${API_URL}/symptom-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_external_id: userExternalId,
                free_text: text,
                urgency: urgency
            }),
        });
        if (!res.ok) throw new Error('Failed to create log');
        return res.json();
    },

    getLogs: async (userExternalId: string): Promise<SymptomLog[]> => {
        const res = await fetch(`${API_URL}/symptom-logs?external_id=${userExternalId}`);
        if (!res.ok) throw new Error('Failed to fetch logs');
        return res.json();
    },

    // AI Upload (Placeholder for valid usage)
    uploadImage: async (file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'X-API-Key': DEMO_API_KEY
            },
            body: formData
        });
        if (!res.ok) throw new Error('Prediction failed');
        return res.json();
    }
};
