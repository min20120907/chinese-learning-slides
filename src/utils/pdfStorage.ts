import { get, set, del } from 'idb-keyval';

export const savePDF = async (id: string, file: Blob): Promise<void> => {
    try {
        await set(`pdf_${id}`, file);
    } catch (error) {
        console.error('Failed to save PDF to IndexedDB:', error);
        throw error;
    }
};

export const loadPDF = async (id: string): Promise<Blob | undefined> => {
    try {
        const file = await get<Blob>(`pdf_${id}`);
        return file;
    } catch (error) {
        console.error('Failed to load PDF from IndexedDB:', error);
        return undefined;
    }
};

export const deletePDF = async (id: string): Promise<void> => {
    try {
        await del(`pdf_${id}`);
    } catch (error) {
        console.error('Failed to delete PDF from IndexedDB:', error);
    }
};
