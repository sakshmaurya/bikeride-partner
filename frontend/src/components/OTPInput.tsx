import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { COLORS } from '../theme/colors';
import { FONT_WEIGHT } from '../theme/fonts';
import { RADIUS } from '../theme/dimensions';

interface OTPInputProps {
  value: string;
  onChange: (otp: string) => void;
}

export default function OTPInput({
  value,
  onChange,
}: OTPInputProps) {
  const digits = Array.from({ length: 6 }, (_, index) => value[index] || '');

  return (
    <View style={styles.wrapper}>
      <View style={styles.boxes} pointerEvents="none">
        {digits.map((digit, index) => {
          const active = value.length === index;
          const filled = digit.length === 1;

          return (
            <View
              key={index}
              style={[
                styles.box,
                active && styles.boxActive,
                filled && styles.boxFilled,
              ]}
            >
              <Text style={styles.digit}>{digit}</Text>
            </View>
          );
        })}
      </View>

      <TextInput
        value={value}
        onChangeText={(text) => {
          onChange(text.replace(/[^0-9]/g, '').slice(0, 6));
        }}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
        caretHidden
        textContentType="oneTimeCode"
        importantForAutofill="yes"
        style={styles.hiddenInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 58,
    justifyContent: 'center',
  },

  boxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  box: {
    width: 46,
    height: 56,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  boxActive: {
    borderColor: COLORS.primary,
  },

  boxFilled: {
    borderColor: COLORS.primary,
  },

  digit: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: FONT_WEIGHT.bold,
  },

  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
});
