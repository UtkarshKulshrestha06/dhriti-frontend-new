
import { Stream, Batch, Subject, LibraryChapter, LibraryResource, User, Course } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://dhriti-backend.onrender.com';

const request = async (endpoint: string, options: RequestInit = {}) => {
    // Guard against undefined params in URL
    if (endpoint.includes('undefined') || endpoint.includes('null')) {
        console.warn(`[API BLOCK] Prevented request with undefined params: ${endpoint}`);
        return null;
    }

    const token = localStorage.getItem('dc_token');
    const fullUrl = `${BASE_URL}${endpoint}`;

    // Log version for debugging
    // @ts-ignore
    if (!window.versionLogged) { console.log(`%c[APP VERSION] ${import.meta.env.VITE_APP_VERSION || "v1.1.0-FIXED"}`, 'background: #22c55e; color: white; padding: 4px; font-weight: bold;'); window.versionLogged = true; }

    console.log(`%c[API REQ] ${options.method || 'GET'} ${fullUrl}`, 'color: #0ea5e9; font-weight: bold;');

    const headers: HeadersInit = {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(fullUrl, { ...options, headers });

        console.log(`%c[API RES] ${response.status} ${response.statusText}`, response.ok ? 'color: green' : 'color: red');

        if (response.status === 401) {
            localStorage.removeItem('dc_token');
            throw new Error("Unauthorized");
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API Error: ${response.status}`);
        }

        if (response.status === 204) return null;
        return await response.json();
    } catch (error) {
        console.error(`API Request Failed for ${endpoint}:`, error);
        throw error;
    }
};

export const api = {
    auth: {
        login: async (email: string, password: string) => {
            const data = await request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            return data; // { token, user: { id, email, role, ... } }
        },
        me: async () => request('/me')
    },

    streams: {
        list: async (): Promise<{ count: number, streams: Stream[] }> => request('/streams'),
        add: async (name: string) => request('/streams', {
            method: 'POST',
            body: JSON.stringify({ name })
        }),
        delete: async (name: string) => request(`/streams/${name}`, {
            method: 'DELETE'
        })
    },

    batches: {
        list: async (stream?: string): Promise<{ count: number, batches: Batch[] }> => {
            const url = stream ? `/batches?stream=${stream}` : '/batches';
            return request(url);
        },
        get: async (id: string): Promise<Batch> => request(`/batches/${id}`)
    },

    courses: {
        list: async (): Promise<Course[]> => {
            const data = await request('/batches');
            return data.batches.map((b: any) => ({
                ...b,
                category: b.stream_name || b.stream_id || 'General', // Fallback for UI
                features: b.features || []
            }));
        },
        get: async (id: string): Promise<Course> => {
            const b = await request(`/batches/${id}`);
            return {
                ...b,
                category: b.stream_name || b.stream_id || 'General',
                features: b.features || []
            };
        },
        create: async (data: Partial<Course>) => request('/batches', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: async (data: Partial<Course>) => request(`/batches/${data.id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: async (id: string) => request(`/batches/${id}`, {
            method: 'DELETE'
        })
    },

    subjects: {
        list: async (batchId: string): Promise<Subject[]> => request(`/subjects?batch=${batchId}`),
        create: async (data: { batch_id: string, name: string }) => request('/subjects', {
            method: 'POST',
            body: JSON.stringify(data)
        })
    },

    chapters: {
        list: async (batchId: string, subjectId: string): Promise<LibraryChapter[]> => {
            return request(`/chapters?batch=${batchId}&subject=${subjectId}`);
        },
        create: async (data: Partial<LibraryChapter>) => request('/chapters', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: async (id: string, data: Partial<LibraryChapter>) => request(`/chapters/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: async (id: string) => request(`/chapters/${id}`, { method: 'DELETE' })
    },

    resources: {
        list: async (batchId: string, subjectId: string, chapterId?: string): Promise<LibraryResource[]> => {
            let url = `/resources?batch=${batchId}&subject=${subjectId}`;
            if (chapterId) url += `&chapter=${chapterId}`;
            return request(url);
        },
        create: async (data: Partial<LibraryResource>) => request('/resources', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: async (id: string, data: Partial<LibraryResource>) => request(`/resources/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        upload: async (formData: FormData): Promise<LibraryResource> => request('/resources/upload', {
            method: 'POST',
            body: formData
        }),
        delete: async (id: string) => request(`/resources/${id}`, { method: 'DELETE' })
    },

    freebies: {
        list: async (subject?: string, type?: string): Promise<LibraryResource[]> => {
            let url = '/freebies';
            const params = new URLSearchParams();
            if (subject) params.append('subject', subject);
            if (type) params.append('type', type);
            if (params.toString()) url += `?${params.toString()}`;
            return request(url);
        },
        upload: async (formData: FormData): Promise<LibraryResource> => {
            return request('/freebies/upload', {
                method: 'POST',
                body: formData
            });
        }
    },

    inquiries: {
        create: async (data: any) => request('/inquiries', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        list: async () => request('/inquiries')
    },

    users: {
        list: async (): Promise<User[]> => request('/users'),
        create: async (userData: any) => {
            return request('/users', { method: 'POST', body: JSON.stringify(userData) });
        },
        update: async (id: string, userData: any) => {
            return request(`/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
        },
        delete: async (id: string) => request(`/users/${id}`, { method: 'DELETE' })
    },

    announcements: {
        list: async (batchId: string) => request(`/announcements?batch=${batchId}`),
        create: async (data: any) => request('/announcements', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: async (id: string, data: any) => request(`/announcements/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: async (id: string) => request(`/announcements/${id}`, {
            method: 'DELETE'
        }),
    },
    timetable: {
        get: async (batchId: string) => request(`/timetable?batch=${batchId}`),
        update: async (batchId: string, items: any) => request(`/timetable/${batchId}`, {
            method: 'PUT',
            body: JSON.stringify({ items })
        })
    },
    enrollments: {
        list: async (userId: string): Promise<{ batch_id: string, enrolled_at: string }[]> => {
            return request(`/enrollments/${userId}`);
        },
        listByBatch: async (batchId: string): Promise<User[]> => {
            return request(`/enrollments/batch/${batchId}`);
        },
        add: async (userId: string, batchId: string) => {
            return request('/enrollments', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, batch_id: batchId })
            });
        },
        remove: async (userId: string, batchId: string) => {
            return request('/enrollments', {
                method: 'DELETE',
                body: JSON.stringify({ user_id: userId, batch_id: batchId })
            });
        }
    }
};
