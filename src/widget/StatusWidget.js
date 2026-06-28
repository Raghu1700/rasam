// The Android home-screen widget UI. Built with react-native-android-widget's
// primitives (FlexWidget / TextWidget) — NOT regular React Native views.
// Shows the partner's live status and a heart button that sends a heartbeat.
import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function StatusWidget({ data }) {
  const d = data || {
    partnerName: 'Partner',
    statusLabel: 'Free',
    statusEmoji: '💚',
  };

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF7F8',
        borderRadius: 20,
        padding: 12,
      }}
    >
      <TextWidget
        text={`${d.partnerName} is`}
        style={{ fontSize: 12, color: '#8A8591' }}
      />
      <TextWidget
        text={`${d.statusEmoji}  ${d.statusLabel}`}
        style={{
          fontSize: 22,
          fontWeight: 'bold',
          color: '#2D2A32',
          marginTop: 2,
        }}
      />

      {/* Tapping anywhere on this row fires the HEARTBEAT click action,
          handled in widgetTaskHandler. */}
      <FlexWidget
        clickAction="HEARTBEAT"
        style={{
          marginTop: 10,
          backgroundColor: '#FF6B81',
          borderRadius: 999,
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text="💗 Send heartbeat"
          style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 'bold' }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
