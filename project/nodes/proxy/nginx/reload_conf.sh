#!/bin/sh
set -e

CONFIG_JSON="/MASTER_CONFIG.json"

PORT=$(jq -r '.port' $CONFIG_JSON)
HOST=$(jq -r '.host' $CONFIG_JSON)
RATE_LIMIT=$(jq -r '.custom_config.rate_limit_rate' $CONFIG_JSON)
FORWARD_HOST=$(jq -r '.forward_host' $CONFIG_JSON)
FORWARD_PORT=$(jq -r '.forward_port' $CONFIG_JSON)
MAX_CONNECTIONS=$(jq -r '.custom_config.max_connections' $CONFIG_JSON)
BURST=$(jq -r '.custom_config.burst' $CONFIG_JSON)
CONNECTION_TIMEOUT=$(jq -r '.custom_config.connection_timeout' $CONFIG_JSON)
READ_TIMEOUT=$(jq -r '.custom_config.read_timeout' $CONFIG_JSON)
SEND_TIMEOUT=$(jq -r '.custom_config.send_timeout' $CONFIG_JSON)

export RATE_LIMIT RATE_LIMIT_STATUS CONN_LIMIT_STATUS \
       FORWARD_HOST FORWARD_PORT PORT HOST \
       MAX_CONNECTIONS BURST \
       CONNECTION_TIMEOUT READ_TIMEOUT SEND_TIMEOUT

envsubst '$RATE_LIMIT $RATE_LIMIT_STATUS $CONN_LIMIT_STATUS \
$FORWARD_HOST $FORWARD_PORT $PORT $HOST \
$MAX_CONNECTIONS $BURST \
$CONNECTION_TIMEOUT $READ_TIMEOUT $SEND_TIMEOUT' \
< /etc/nginx/nginx.conf.template \
> /etc/nginx/nginx.conf