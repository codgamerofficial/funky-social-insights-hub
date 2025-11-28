import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
    totalFollowers: number;
    engagementRate: number;
    postReach: number;
    growthRate: number;
    followersChange: string;
    engagementChange: string;
    reachChange: string;
    growthChange: string;
}

export const useDashboardData = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['dashboard-stats', user?.id],
        queryFn: async (): Promise<DashboardStats> => {
            if (!user) throw new Error('User not authenticated');

            // Fetch latest analytics data
            const { data: latestData, error: latestError } = await supabase
                .from('analytics_data')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(1)
                .single();

            // Fetch previous period data for comparison
            const { data: previousData } = await supabase
                .from('analytics_data')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .range(1, 1)
                .single();

            // Calculate stats
            const totalFollowers = latestData?.followers_count || 0;
            const engagementRate = latestData?.engagement_rate || 0;
            const postReach = latestData?.reach || 0;

            // Calculate growth rate (followers change percentage)
            let growthRate = 0;
            if (previousData && previousData.followers_count > 0) {
                growthRate = ((totalFollowers - previousData.followers_count) / previousData.followers_count) * 100;
            }

            // Calculate changes
            const followersChange = previousData
                ? `${totalFollowers > previousData.followers_count ? '+' : ''}${((totalFollowers - previousData.followers_count) / previousData.followers_count * 100).toFixed(1)}% from last period`
                : 'No previous data';

            const engagementChange = previousData
                ? `${engagementRate > previousData.engagement_rate ? '+' : ''}${(engagementRate - previousData.engagement_rate).toFixed(1)}% from last period`
                : 'No previous data';

            const reachChange = previousData
                ? `${postReach > previousData.reach ? '+' : ''}${((postReach - previousData.reach) / previousData.reach * 100).toFixed(1)}% from last period`
                : 'No previous data';

            const growthChange = `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}% growth rate`;

            return {
                totalFollowers,
                engagementRate,
                postReach,
                growthRate,
                followersChange,
                engagementChange,
                reachChange,
                growthChange,
            };
        },
        enabled: !!user,
    });
};
