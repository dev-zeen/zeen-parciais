import { useState } from 'react';
import {  Dimensions,  LayoutChangeEvent  } from 'react-native';
import { LineChart as RNLineChart } from 'react-native-chart-kit';

import { View } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';

type LineChartProps = {
  data: number[];
  labels?: string[];
  height?: number;
  showGrid?: boolean;
  width?: number;
};

export function LineChart({ data, labels, height = 100, showGrid = false, width }: LineChartProps) {
  const colorTheme = useThemeColor();
  const screenWidth = Dimensions.get('window').width;
  const [containerWidth, setContainerWidth] = useState(width || screenWidth - 64);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: layoutWidth } = event.nativeEvent.layout;
    if (layoutWidth > 0 && !width) {
      setContainerWidth(layoutWidth);
    }
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: colorTheme === 'dark' ? '#1F2937' : '#F9FAFB',
    backgroundGradientTo: colorTheme === 'dark' ? '#1F2937' : '#F9FAFB',
    decimalPlaces: 0,
    color: (opacity = 1) => (colorTheme === 'dark' ? `rgba(59, 130, 246, ${opacity})` : `rgba(37, 99, 235, ${opacity})`),
    labelColor: (opacity = 1) => (colorTheme === 'dark' ? `rgba(156, 163, 175, ${opacity})` : `rgba(107, 114, 128, ${opacity})`),
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '3',
      strokeWidth: '2',
      stroke: colorTheme === 'dark' ? '#3B82F6' : '#2563EB',
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // solid background lines
      stroke: colorTheme === 'dark' ? '#374151' : '#E5E7EB',
      strokeWidth: showGrid ? 1 : 0,
    },
  };

  const chartData = {
    labels: labels || data.map((_, i) => `${i + 1}`),
    datasets: [
      {
        data,
        color: (opacity = 1) => (colorTheme === 'dark' ? `rgba(59, 130, 246, ${opacity})` : `rgba(37, 99, 235, ${opacity})`),
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View onLayout={handleLayout} style={{ width: '100%' }}>
      <RNLineChart
        data={chartData}
        width={width || containerWidth}
        height={height}
        chartConfig={chartConfig}
        bezier
        withInnerLines={showGrid}
        withOuterLines={false}
        withVerticalLabels={false}
        withHorizontalLabels={false}
        withDots={data.length <= 10}
        style={{
          marginVertical: 8,
          borderRadius: 16,
          marginLeft: -16,
        }}
      />
    </View>
  );
}
