import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    Brush
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface ChartDataPoint {
    date: string;
    value: number;
    platform?: string;
    engagement?: number;
    reach?: number;
    followers?: number;
}

interface AdvancedChartProps {
    data: ChartDataPoint[];
    type: 'line' | 'area' | 'bar' | 'pie';
    title: string;
    color?: string;
    height?: number;
    showBrush?: boolean;
    showTrend?: boolean;
}

const COLORS = {
    primary: '#8b5cf6',
    secondary: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    youtube: '#ff0000',
    facebook: '#1877f2',
    instagram: '#e4405f'
};

export const AdvancedLineChart = ({
    data,
    title,
    color = COLORS.primary,
    height = 300,
    showBrush = true,
    showTrend = false
}: AdvancedChartProps) => {
    const trendData = data.map((point, index) => {
        if (index === 0) return { ...point, trend: point.value };

        const prevValue = data[index - 1].value;
        const change = ((point.value - prevValue) / prevValue) * 100;

        return {
            ...point,
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
            changePercent: Math.abs(change)
        };
    });

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'down':
                return <TrendingDown className="w-4 h-4 text-red-500" />;
            default:
                return <Minus className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{title}</h3>
                {showTrend && trendData.length > 1 && (
                    <div className="flex items-center gap-2">
                        {getTrendIcon(trendData[trendData.length - 1].trend)}
                        <Badge variant="outline" className={
                            trendData[trendData.length - 1].trend === 'up' ? 'border-green-500 text-green-500' :
                                trendData[trendData.length - 1].trend === 'down' ? 'border-red-500 text-red-500' :
                                    'border-gray-500 text-gray-500'
                        }>
                            {trendData[trendData.length - 1].trend === 'up' ? '+' : ''}
                            {trendData[trendData.length - 1].changePercent?.toFixed(1)}%
                        </Badge>
                    </div>
                )}
            </div>

            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.6)"
                        fontSize={12}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.6)"
                        fontSize={12}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: 'white'
                        }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        dot={{ fill: color, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                    />
                    {showBrush && <Brush dataKey="date" height={30} stroke={color} />}
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

export const AdvancedAreaChart = ({
    data,
    title,
    color = COLORS.primary,
    height = 300
}: Omit<AdvancedChartProps, 'type'>) => {
    return (
        <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={height}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: 'white'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#gradient-${title})`}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
};

export const PlatformComparisonChart = ({
    data,
    title,
    height = 300
}: Omit<AdvancedChartProps, 'type' | 'color'>) => {
    const platforms = ['youtube', 'facebook', 'instagram'];
    const platformColors = [COLORS.youtube, COLORS.facebook, COLORS.instagram];

    return (
        <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: 'white'
                        }}
                    />
                    <Legend />
                    {platforms.map((platform, index) => (
                        <Line
                            key={platform}
                            type="monotone"
                            dataKey={platform}
                            stroke={platformColors[index]}
                            strokeWidth={2}
                            dot={{ fill: platformColors[index], strokeWidth: 2, r: 3 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

export const EngagementPieChart = ({
    data,
    title,
    height = 300
}: Omit<AdvancedChartProps, 'type' | 'color'>) => {
    const platformColors = [COLORS.youtube, COLORS.facebook, COLORS.instagram, COLORS.secondary];

    return (
        <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={platformColors[index % platformColors.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: 'white'
                        }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
};

export const HeatmapChart = ({
    data,
    title,
    height = 200
}: Omit<AdvancedChartProps, 'type' | 'color'>) => {
    // Generate heatmap data (hour x day of week)
    const heatmapData = Array.from({ length: 7 }, (_, day) =>
        Array.from({ length: 24 }, (_, hour) => ({
            day,
            hour,
            value: Math.random() * 100 // This would be real engagement data
        }))
    ).flat();

    const getHeatmapColor = (value: number) => {
        const intensity = value / 100;
        return `rgba(139, 92, 246, ${intensity})`;
    };

    return (
        <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="grid grid-cols-24 gap-1" style={{ height }}>
                {heatmapData.map((point, index) => (
                    <div
                        key={index}
                        className="rounded"
                        style={{
                            backgroundColor: getHeatmapColor(point.value),
                            aspectRatio: '1'
                        }}
                        title={`Day ${point.day}, Hour ${point.hour}: ${point.value.toFixed(1)}%`}
                    />
                ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
            </div>
        </Card>
    );
};