#!/bin/sh

/reload_conf.sh

exec nginx -g "daemon off;"
