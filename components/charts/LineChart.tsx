import { useState } from 'react';
import {  Dimensions,  LayoutChangeEvent, Text  } from 'react-native';
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
    backgroundColor: colorTheme === 'dark' ? '#111827' : '#F9FAFB',
    backgroundGradientFrom: colorTheme === 'dark' ? '#111827' : '#F9FAFB',
    backgroundGradientTo: colorTheme === 'dark' ? '#111827' : '#F9FAFB',
    decimalPlaces: 1,
    color: (opacity = 1) => (colorTheme === 'dark' ? `rgba(59, 130, 246, ${opacity})` : `rgba(37, 99, 235, ${opacity})`),
    labelColor: (opacity = 1) => (colorTheme === 'dark' ? `rgba(156, 163, 175, ${opacity})` : `rgba(107, 114, 128, ${opacity})`),
    style: {
      borderRadius: 0,
    },
    propsForVerticalLabels: {
      fontSize: 10,
      fontWeight: '500',
    },
    propsForHorizontalLabels: {
      fontSize: 10,
      fontWeight: '500',
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colorTheme === 'dark' ? '#3B82F6' : '#2563EB',
      fill: colorTheme === 'dark' ? '#111827' : '#F9FAFB',
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
    <View onLayout={handleLayout} style={{ width: '100%', backgroundColor: 'transparent' }}>
      <RNLineChart
        data={chartData}
        width={width || containerWidth}
        height={height}
        chartConfig={chartConfig}
        bezier
        withInnerLines={showGrid}
        withOuterLines={false}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        withDots={data.length <= 10}
        segments={3}
        style={{
          marginVertical: 8,
          marginLeft: -8,
          marginRight: -8,
        }}
        fromZero
        yAxisSuffix=""
        yAxisInterval={1}
        renderDotContent={({ x, y, index }) => (
          <Text
            key={index}
            style={{
              position: 'absolute',
              top: y - 20,
              left: x - 15,
              fontSize: 10,
              fontWeight: '600',
              color: colorTheme === 'dark' ? '#60A5FA' : '#2563EB',
              backgroundColor: colorTheme === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(249, 250, 251, 0.95)',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              overflow: 'hidden',
            }}>
            {data[index].toFixed(1)}
          </Text>
        )}
      />
    </View>
  );
}
