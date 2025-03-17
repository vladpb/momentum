import { useEffect, useState } from 'react';
import { saveToIndexedDB, getFromIndexedDB } from '../utils/indexedDBManager';

/**
 * Hook to sync data between Zustand stores and IndexedDB
 * 
 * @param storeName - Name of the IndexedDB store to sync with
 * @param data - Data from Zustand store to sync
 * @param setData - Function to update Zustand store
 * @param enabled - Whether the sync is enabled
 * @returns Object containing loading state and any sync errors
 */
export function useIndexedDBSync<T>(
    storeName: string,
    data: T[],
    setData: (data: T[]) => void,
    enabled = true
): { loading: boolean; error: Error | null } {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    // Initial load from IndexedDB
    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }
        
        let isMounted = true;
        
        const loadFromIndexedDB = async () => {
            try {
                setLoading(true);
                const storedData = await getFromIndexedDB<T>(storeName);
                
                if (isMounted && storedData && storedData.length > 0) {
                    setData(storedData);
                }
                
                if (isMounted) {
                    setLoading(false);
                    setError(null);
                }
            } catch (err) {
                console.error(`Error loading data from IndexedDB (${storeName}):`, err);
                if (isMounted) {
                    setLoading(false);
                    setError(err instanceof Error ? err : new Error(`Failed to load from IndexedDB: ${err}`));
                }
            }
        };
        
        loadFromIndexedDB();
        
        return () => {
            isMounted = false;
        };
    }, [storeName, setData, enabled]);
    
    // Save to IndexedDB when data changes
    useEffect(() => {
        if (!enabled || loading) {
            return;
        }
        
        const saveData = async () => {
            try {
                await saveToIndexedDB(storeName, data);
                setError(null);
            } catch (err) {
                console.error(`Error saving data to IndexedDB (${storeName}):`, err);
                setError(err instanceof Error ? err : new Error(`Failed to save to IndexedDB: ${err}`));
            }
        };
        
        saveData();
    }, [data, storeName, enabled, loading]);
    
    return { loading, error };
}

export default useIndexedDBSync; 