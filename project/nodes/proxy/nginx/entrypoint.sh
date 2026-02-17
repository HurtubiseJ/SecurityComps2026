#!/bin/sh
set -e

CONFIG_JSON="/config/settings.json"

RATE_LIMIT=$(jq -r 'custom_config.rate_limit_rate' $CONFIG_JSON)
FORWARD_HOST=$(jq -r 'custom_config.forward_host' $CONFIG_JSON)
FORWARD_PORT=$(jq -r 'custom_config.forward_port' $CONFIG_JSON)
MAX_CONNECTIONS=$(jq -r 'custom_config.max_connections' $CONFIG_JSON)
BURST=$(jq -r 'custom_config.burst' $CONFIG_JSON)
CONNECT_TIMEOUT=$(jq -r 'custom_config.connect_timeout' $CONFIG_JSON)
READ_TIMEOUT=$(jq -r 'custom_config.read_timeout' $CONFIG_JSON)
SEND_TIMEOUT=$(jq -r 'custom_config.send_timeout' $CONFIG_JSON)

export RATE_LIMIT RATE_LIMIT_STATUS CONN_LIMIT_STATUS \
       UPSTREAM_HOST UPSTREAM_PORT LISTEN_PORT ALT_LISTEN_PORT \
       DOCKER_NETWORK MAX_CONNECTIONS BURST \
       CONNECT_TIMEOUT READ_TIMEOUT SEND_TIMEOUT

envsubst < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

exec nginx -g "daemon off;"
