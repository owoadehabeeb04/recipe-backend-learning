"use client";

import { useMemo } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartProps {
  statistics: {
    allRecipes: number;
    myRecipes: number;
    publishedRecipes: number;
    unpublishedRecipes: number;
  };
  isLoading: boolean;
}

export const DashboardCharts = ({ 
  statistics = {
    allRecipes: 0,
    myRecipes: 0,
    publishedRecipes: 0,
    unpublishedRecipes: 0
  }, 
  isLoading 
}: ChartProps) => {
  // Chart configuration with purple theme colors
  const chartConfig = {
    allRecipes: {
      label: "All Recipes",
      color: "hsl(var(--primary))",
    },
    myRecipes: {
      label: "My Recipes",
      color: "hsl(270 65% 70%)",
    },
    published: {
      label: "Published",
      color: "hsl(270 60% 60%)",
    },
    unpublished: {
      label: "Unpublished",
      color: "hsl(270 55% 50%)",
    },
  };

  // Generate area chart data with natural growth pattern
  const areaChartData = useMemo(() => {
    if (isLoading) {
      return Array(12).fill(null).map((_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        allRecipes: 0,
        myRecipes: 0,
        published: 0,
        unpublished: 0,
      }));
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, i) => {
      // Natural growth curve with some variation
      const progress = i / 11; // 0 to 1
      const growthFactor = progress * 0.7 + 0.3; // Start at 30%, grow to 100%
      const variation = Math.sin(progress * Math.PI * 2) * 0.05; // Small natural variation
      
      return {
        month,
        allRecipes: Math.max(0, Math.round(statistics.allRecipes * (growthFactor + variation))),
        myRecipes: Math.max(0, Math.round(statistics.myRecipes * (growthFactor + variation))),
        published: Math.max(0, Math.round(statistics.publishedRecipes * (growthFactor + variation))),
        unpublished: Math.max(0, Math.round(statistics.unpublishedRecipes * (growthFactor + variation))),
      };
    });
  }, [statistics, isLoading]);

  // Pie chart data - showing published vs unpublished
  const pieChartData = useMemo(() => {
    if (isLoading) {
      return [
        { name: "Published", value: 1, fill: chartConfig.published.color },
        { name: "Unpublished", value: 1, fill: chartConfig.unpublished.color },
      ];
    }

    const published = statistics.publishedRecipes || 0;
    const unpublished = statistics.unpublishedRecipes || 0;
    const total = published + unpublished;

    if (total === 0) {
      return [
        { name: "No Data", value: 1, fill: "hsl(var(--muted))" },
      ];
    }

    return [
      { 
        name: "Published", 
        value: published,
        fill: chartConfig.published.color 
      },
      { 
        name: "Unpublished", 
        value: unpublished,
        fill: chartConfig.unpublished.color 
      },
    ].filter(item => item.value > 0);
  }, [statistics, isLoading, chartConfig]);

  return (
    <div className="mt-6 grid lg:grid-cols-3 grid-cols-1 flex-col lg:flex-row gap-6">
      {/* Area Chart - Recipe Growth Trends */}
      <Card className="lg:col-span-2 col-span-1">
        <CardHeader>
          <CardTitle>Recipe Growth Trends</CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-80 w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="w-full h-80">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <AreaChart data={areaChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                    width={60}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="allRecipes" 
                    stroke={chartConfig.allRecipes.color}
                    strokeWidth={2}
                    fill={chartConfig.allRecipes.color}
                    fillOpacity={0.1}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="published" 
                    stroke={chartConfig.published.color}
                    strokeWidth={2}
                    fill={chartConfig.published.color}
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pie Chart - Recipe Distribution */}
      <Card className="lg:col-span-1 w-full overflow-hidden">
        <CardHeader>
          <CardTitle>Recipe Distribution</CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-80 w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="w-full h-80">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius="70%"
                    innerRadius="40%"
                    fill="#8884d8"
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;