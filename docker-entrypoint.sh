#!/bin/sh

# If VITE_BACKEND_URL is provided as an environment variable, update config.js
if [ -n "$VITE_BACKEND_URL" ]; then
  sed -i "s|window.APP_CONFIG = {|window.APP_CONFIG = { BACKEND_URL: '$VITE_BACKEND_URL', |" /usr/share/nginx/html/config.js
fi

# Execute the main container command
exec "$@"