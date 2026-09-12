#!/bin/bash

IP=$(hostname -I | tr ' ' '\n' | grep '^192\.168\.' | head -n 1)

if [ -z "$IP" ]; then
  echo "❌ LAN IP not found"
  exit 1
fi

export EXPO_PUBLIC_API_IP="$IP"

echo "✅ API IP: $EXPO_PUBLIC_API_IP"

npx expo start -c
