import React from 'react';
import { View } from 'react-native';

type PixelTextureProps = {
  baseColor?: string;
  accentColor?: string;
  rows?: number;
  cols?: number;
  opacity?: number;
};

export const PixelTexture: React.FC<PixelTextureProps> = ({
  baseColor = '#f5f5f5',     // background
  accentColor = '#cccccc',   // scattered pixels
  rows = 20,
  cols = 20,
  opacity = 0.2,
}) => {
  return (
    <View style={{ flex: 1, flexDirection: 'column', position: 'absolute', width: '100%', height: '100%' }}>
      {Array.from({ length: rows }).map((_, row) => (
        <View key={row} style={{ flex: 1, flexDirection: 'row' }}>
          {Array.from({ length: cols }).map((_, col) => {
            const isAccent = Math.random() > 0.75; // ~25% chance
            return (
              <View
                key={col}
                style={{
                  flex: 1,
                  backgroundColor: isAccent ? accentColor : baseColor,
                  opacity,
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};
