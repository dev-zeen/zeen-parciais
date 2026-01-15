import { useState } from 'react';
import {  LayoutChangeEvent, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';

type BarChartProps = {
  data: number[];
  labels?: string[];
  height?: number;
  width?: number;
};

export function BarChart({ data, labels, height = 180 }: BarChartProps) {
  const colorTheme = useThemeColor();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: layoutWidth } = event.nativeEvent.layout;
    if (layoutWidth > 0) {
      setContainerWidth(layoutWidth);
    }
  };

  const maxValue = Math.max(...data.map(Math.abs), 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue;

  const chartLabels = labels || data.map((_, i) => `R${i + 1}`);
  const barWidth = containerWidth > 0 ? (containerWidth - 32) / data.length - 4 : 30;

  const handleBarPress = (index: number) => {
    setSelectedIndex(index);
    setTimeout(() => setSelectedIndex(null), 2000);
  };

  return (
    <View onLayout={handleLayout} style={{ width: '100%', paddingHorizontal: 16 }}>
      {/* Selected Value Tooltip */}
      {selectedIndex !== null && (
        <View 
          className="absolute z-10 px-3 py-2 rounded-lg"
          style={{
            backgroundColor: colorTheme === 'dark' ? '#1f2937' : '#ffffff',
            top: -40,
            left: selectedIndex * (barWidth + 4) + barWidth / 2 - 40,
            borderWidth: 2,
            borderColor: '#3b82f6',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}>
          <Text className="text-xs font-medium text-gray-500 text-center" style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
            {chartLabels[selectedIndex]}
          </Text>
          <Text className="text-base font-bold text-blue-600 text-center">
            {data[selectedIndex].toFixed(1)} pts
          </Text>
        </View>
      )}

      {/* Chart Container */}
      <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 4, paddingTop: 50 }}>
        {data.map((value, index) => {
          const isPositive = value >= 0;
          const barHeight = Math.abs((value / range) * (height - 80));
          const isSelected = selectedIndex === index;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={() => handleBarPress(index)}
              style={{
                width: barWidth,
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '100%',
              }}>
              {/* Bar */}
              <View
                style={{
                  width: '100%',
                  height: Math.max(barHeight, 4),
                  backgroundColor: isSelected 
                    ? '#60a5fa' 
                    : isPositive 
                    ? colorTheme === 'dark' ? '#3b82f6' : '#2563eb'
                    : '#ef4444',
                  borderRadius: 4,
                  opacity: isSelected ? 1 : 0.9,
                  transform: [{ scale: isSelected ? 1.05 : 1 }],
                }}
              />
              
              {/* Label */}
              <Text 
                className="text-xs font-medium mt-1"
                style={{ 
                  color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280',
                  fontSize: 10,
                }}>
                {chartLabels[index]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Zero Line */}
      {minValue < 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: 20 + (Math.abs(minValue) / range) * (height - 80),
            left: 16,
            right: 16,
            height: 1,
            backgroundColor: colorTheme === 'dark' ? '#4b5563' : '#d1d5db',
          }}
        />
      )}
    </View>
  );
}
