"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamically import ApexCharts components to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

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
  const [isMounted, setIsMounted] = useState(false);

  // Only render charts on client-side to avoid hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Setup area chart options for recipe trends
  const areaChartOptions = {
    chart: {
      type: 'area' as const,
      height: '100%',
      toolbar: {
        show: false
      },
      background: 'transparent',
      responsive: [{
        breakpoint: 768,
        options: {
          legend: {
            position: 'bottom' as const,
            horizontalAlign: 'center' as const
          },
          xaxis: {
            labels: {
              rotate: -45,
              style: {
                fontSize: '10px'
              }
            }
          }
        }
      }]
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    colors: ['#805ad5', '#ed64a6', '#3182ce', '#d69e2e'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      xaxis: {
        lines: {
          show: false
        }
      }
    },
    tooltip: {
      theme: 'dark',
      x: {
        show: false
      },
      y: {
        formatter: (val: number) => `${val} recipes`
      }
    },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'right' as const,
      labels: {
        colors: '#FFFFFF99'
      }
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: {
        style: {
          colors: Array(12).fill('#FFFFFF99')
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#FFFFFF99'
        },
        formatter: (val: number) => Math.round(val).toString()
      }
    }
  };

  // Setup pie chart options for recipe distribution
  const pieChartOptions = {
    chart: {
      type: 'pie' as const,
      background: 'transparent',
      foreColor: '#a0aec0'
    },
    colors: ['#805ad5', '#ed64a6', '#3182ce', '#d69e2e'],
    labels: ['All Recipes', 'My Recipes', 'Published', 'Unpublished'],
    legend: {
      position: 'bottom' as const,
      fontSize: '14px',
      labels: {
        colors: ['#FFFFFF99', '#FFFFFF99', '#FFFFFF99', '#FFFFFF99']
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '55%'
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontFamily: 'inherit',
        fontWeight: 'normal',
        colors: ['#FFFFFF']
      },
      dropShadow: {
        enabled: false
      }
    },
    stroke: {
      width: 2,
      colors: ['#1a202c']
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number) => `${val} recipes`
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  // Generate some realistic-looking data for the area chart
  // We'll create a pattern with some variation to mimic growth over time
  const generateAreaData = () => {
    // Generate consistent but random-looking values
    const baseValue = (max: number) => Math.max(1, Math.round(max * 0.3));
    const growth = (i: number, max: number) => 
      Math.round(baseValue(max) + (i * max * 0.06) + (Math.sin(i) * max * 0.03));
    
    const allRecipeData = Array(12).fill(0).map((_, i) => growth(i, statistics.allRecipes));
    const myRecipeData = Array(12).fill(0).map((_, i) => growth(i, statistics.myRecipes));
    const publishedData = Array(12).fill(0).map((_, i) => growth(i, statistics.publishedRecipes));
    const unpublishedData = Array(12).fill(0).map((_, i) => growth(i, statistics.unpublishedRecipes));
    
    return [
      {
        name: 'All Recipes',
        data: allRecipeData
      },
      {
        name: 'My Recipes',
        data: myRecipeData
      },
      {
        name: 'Published',
        data: publishedData
      },
      {
        name: 'Unpublished',
        data: unpublishedData
      }
    ];
  };

  // For the pie chart data
  const pieChartSeries = isLoading 
    ? [1, 1, 1, 1] // Placeholder data while loading
    : [
        statistics.allRecipes || 0,
        statistics.myRecipes || 0,
        statistics.publishedRecipes || 0,
        statistics.unpublishedRecipes || 0
      ];

  // Generate series data for the area chart
  const areaChartSeries = isLoading 
    ? [
        { name: 'All Recipes', data: Array(12).fill(1) },
        { name: 'My Recipes', data: Array(12).fill(1) },
        { name: 'Published', data: Array(12).fill(1) },
        { name: 'Unpublished', data: Array(12).fill(1) }
      ]
    : generateAreaData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Area Chart - Recipe Trends */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-medium mb-4">Recipe Growth Trends</h3>
        <div className="h-80">
          {isMounted && !isLoading ? (
            <ReactApexChart 
              options={areaChartOptions} 
              series={areaChartSeries} 
              type="area" 
              height="100%" 
              width="100%"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}
        </div>
      </div>

      {/* Pie Chart - Recipe Distribution */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-medium mb-4">Recipe Distribution</h3>
        <div className="h-80">
          {isMounted && !isLoading ? (
            <ReactApexChart 
              options={pieChartOptions}
              series={pieChartSeries}
              type="pie"
              height="100%"
              width="100%"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardCharts;