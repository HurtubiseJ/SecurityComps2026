# Pi testing info

# Proxy Node

This node sits between clients/attackers and the target service.

Traffic path:
client/attacker -> proxy -> target

## Quick test (no sudo, Python proxy)
On proxy node:
python3 python/proxy.py

Health check:
curl http://<PROXY_IP>:8000/proxy-health

Forwarding test:
curl http://<PROXY_IP>:8000/

## Nginx mode (requires nginx installed + sudo)
Test config:
sudo nginx -t -c $(pwd)/nginx/nginx.conf

Run nginx with our config:
sudo nginx -c $(pwd)/nginx/nginx.conf

Stop:
sudo nginx -s stop


##  Grape 00 (target) - IP: 137.22.4.153
## Grape 01(proxy) - IP: 137.22.4.154
## Grape 02 (client) - IP: 137.22.4.163