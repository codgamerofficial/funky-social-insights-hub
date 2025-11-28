import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AIInsight {
    id: string;
    title: string;
    content: string;
    category: 'engagement' | 'growth' | 'content' | 'audience' | 'general';
    priority: 'low' | 'medium' | 'high';
    is_read: boolean;
    created_at: string;
}

export const useAIInsights = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['ai-insights', user?.id],
        queryFn: async (): Promise<AIInsight[]> => {
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('ai_insights')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data || [];
        },
        enabled: !!user,
    });
};
