
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { LibraryResource, LibraryChapter, BatchAnnouncement } from '../types';

export const useViewStatus = () => {
    const { user } = useAuth();
    const userId = user?.id || 'guest';

    const [viewedResources, setViewedResources] = useState<Set<string>>(new Set());
    const [viewedChapters, setViewedChapters] = useState<Set<string>>(new Set());
    const [viewedPublicRes, setViewedPublicRes] = useState<Set<string>>(new Set());
    const [batchLastSeen, setBatchLastSeen] = useState<Record<string, number>>({});

    // Keys for local storage
    const RES_KEY = `viewed_res_${userId}`;
    const CH_KEY = `viewed_ch_${userId}`;
    const PUBLIC_RES_KEY = `viewed_public_res_${userId}`;
    const BATCH_SEEN_KEY = `batch_last_seen_${userId}`;

    // Load from storage
    useEffect(() => {
        try {
            const res = localStorage.getItem(RES_KEY);
            const ch = localStorage.getItem(CH_KEY);
            const pub = localStorage.getItem(PUBLIC_RES_KEY);
            const batch = localStorage.getItem(BATCH_SEEN_KEY);

            if (res) setViewedResources(new Set(JSON.parse(res)));
            if (ch) setViewedChapters(new Set(JSON.parse(ch)));
            if (pub) setViewedPublicRes(new Set(JSON.parse(pub)));
            if (batch) setBatchLastSeen(JSON.parse(batch));
        } catch (e) {
            console.error("Failed to load view status", e);
        }
    }, [userId]);

    // Helpers to save
    const save = (key: string, value: any) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    // Actions
    const markResourceAsRead = useCallback((id: string) => {
        setViewedResources(prev => {
            const next = new Set(prev).add(id);
            save(RES_KEY, Array.from(next));
            return next;
        });
    }, [RES_KEY]);

    const markChapterAsRead = useCallback((id: string) => {
        setViewedChapters(prev => {
            const next = new Set(prev).add(id);
            save(CH_KEY, Array.from(next));
            return next;
        });
    }, [CH_KEY]);

    const markPublicResourceAsRead = useCallback((id: string) => {
        setViewedPublicRes(prev => {
            const next = new Set(prev).add(id);
            save(PUBLIC_RES_KEY, Array.from(next));
            return next;
        });
    }, [PUBLIC_RES_KEY]);

    const markBatchAsSeen = useCallback((batchId: string) => {
        setBatchLastSeen(prev => {
            const next = { ...prev, [batchId]: Date.now() };
            save(BATCH_SEEN_KEY, next);
            return next;
        });
    }, [BATCH_SEEN_KEY]);

    // Queries
    const isResourceUnread = useCallback((res: LibraryResource) => {
        const isNew = res.is_new || res.isNew;
        if (!isNew) return false;
        return !viewedResources.has(res.id);
    }, [viewedResources]);

    const isChapterUnread = useCallback((chapter: LibraryChapter, resources: LibraryResource[]) => {
        // Direct "new" flag on chapter
        if ((chapter.is_new || chapter.isNew) && !viewedChapters.has(chapter.id)) return true;

        // Or unread resources inside
        const chapterResources = resources.filter(r => (r.chapter_id || r.chapterId) === chapter.id);
        return chapterResources.some(r => isResourceUnread(r));
    }, [viewedChapters, isResourceUnread]);

    const isAnnouncementUnread = useCallback((ann: BatchAnnouncement) => {
        const batchId = ann.batch_id || ann.batchId;
        if (!batchId) return false;

        const lastSeen = batchLastSeen[batchId] || 0;
        const annTime = new Date(ann.created_at || ann.date).getTime();

        return annTime > lastSeen;
    }, [batchLastSeen]);

    const hasUnreadAnnouncements = useCallback((batchId: string, announcements: BatchAnnouncement[]) => {
        return announcements.some(ann => isAnnouncementUnread(ann));
    }, [isAnnouncementUnread]);

    const isPublicResourceUnread = useCallback((res: { id: string, is_new?: boolean, isNew?: boolean }) => {
        const isNew = res.is_new || res.isNew;
        if (!isNew) return false;
        return !viewedPublicRes.has(res.id);
    }, [viewedPublicRes]);

    return {
        markResourceAsRead,
        markChapterAsRead,
        markPublicResourceAsRead,
        markBatchAsSeen,
        isResourceUnread,
        isChapterUnread,
        isAnnouncementUnread,
        hasUnreadAnnouncements,
        isPublicResourceUnread,
        viewedResources,
        viewedChapters,
        viewedPublicRes,
        batchLastSeen
    };
};
