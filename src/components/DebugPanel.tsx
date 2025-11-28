/**
 * Debug Panel Component
 * Helps identify authentication and database connection issues
 */

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const DebugPanel = () => {
    const { user, loading, session } = useAuth();
    const [dbStatus, setDbStatus] = useState<string>('Not tested');
    const [tableExists, setTableExists] = useState<string>('Not tested');

    const testDatabaseConnection = async () => {
        try {
            setDbStatus('Testing...');
            const { data, error } = await supabase
                .from('platform_connections')
                .select('count')
                .limit(1);

            if (error) {
                setDbStatus(`Error: ${error.message}`);
            } else {
                setDbStatus('Success: Table accessible');
            }
        } catch (err: any) {
            setDbStatus(`Exception: ${err.message}`);
        }
    };

    const testTableExists = async () => {
        try {
            setTableExists('Testing...');
            const { data, error } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public')
                .eq('table_name', 'platform_connections');

            if (error) {
                setTableExists(`Error: ${error.message}`);
            } else {
                setTableExists(data?.length ? 'Table exists' : 'Table does not exist');
            }
        } catch (err: any) {
            setTableExists(`Exception: ${err.message}`);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
            <h3 className="font-bold mb-2">Debug Panel</h3>
            <div className="text-sm space-y-1">
                <p><strong>User:</strong> {user ? `${user.email} (${user.id})` : 'Not logged in'}</p>
                <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
                <p><strong>DB Status:</strong> {dbStatus}</p>
                <p><strong>Table Exists:</strong> {tableExists}</p>
            </div>
            <div className="mt-2 space-x-2">
                <Button
                    size="sm"
                    onClick={testDatabaseConnection}
                    className="bg-white text-red-500 text-xs"
                >
                    Test DB
                </Button>
                <Button
                    size="sm"
                    onClick={testTableExists}
                    className="bg-white text-red-500 text-xs"
                >
                    Test Table
                </Button>
            </div>
        </div>
    );
};

export default DebugPanel;