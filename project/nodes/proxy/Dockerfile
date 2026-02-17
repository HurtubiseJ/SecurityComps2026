FROM nginx:1.25-alpine

RUN apk add --no-cache gettext

COPY nginx/nginx.conf.template /etc/nginx/nginx.conf.template

CMD sh -c "envsubst '\
$RATE_LIMIT \
$RATE_LIMIT_STATUS \
$CONN_LIMIT_STATUS \
$UPSTREAM_HOST \
$UPSTREAM_PORT \
$LISTEN_PORT \
$ALT_LISTEN_PORT \
$DOCKER_NETWORK \
$MAX_CONNECTIONS \
$BURST \
$CONNECT_TIMEOUT \
$READ_TIMEOUT \
$SEND_TIMEOUT \
' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf.gen && \
nginx -g 'daemon off;'"
