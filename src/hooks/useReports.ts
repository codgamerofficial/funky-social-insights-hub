import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Report {
    id: string;
    title: string;
    description: string | null;
    report_type: 'weekly' | 'monthly' | 'custom' | 'export';
    date_range_start: string | null;
    date_range_end: string | null;
    data: any;
    file_url: string | null;
    created_at: string;
}

export const useReports = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['reports', user?.id],
        queryFn: async (): Promise<Report[]> => {
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data || [];
        },
        enabled: !!user,
    });
};
