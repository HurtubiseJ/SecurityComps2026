import threading
import subprocess
import logging
import json
#IP Spoof sudo hping3 -S -p 80 -a 1.2.3.4 example.com
# Set packecount/interval sudo hping3 -S -p 443 -c 10 -i u1000 example.com
# Trace sudo hping3 -S -p 80 --traceroute example.com

RUNNING_PROCESS = None

# logger = logging.getLogger("attacker2")

def run_hping3():
    with open("../MASTER_CONFIG.json", "r") as f:
        config = json.load(f)

    if not config:
        return False

    port = config.get("forward_port")
    host = config.get("forward_host")

    cust_config = config.get("custom_config")

    interval = cust_config.get("packet_interval_ms")
    protocol = cust_config.get("protocol")

    global RUNNING_PROCESS
    
    cmd = ['hping3']
    if protocol == "TCP":
        cmd.append("-S")
        cmd.append("-p")
        cmd.append(port)
        cmd.append("-i")
        cmd.append(f"u{interval}")
        cmd.append(host)
    elif protocol == "UDP":
        cmd.append("--udp")
        cmd.append("-p")
        cmd.append(port)
        cmd.append("-i")
        cmd.append(f"u{interval}")
        cmd.append(host)
    elif protocol == "ICMP":
        cmd.append("--icmp")
        cmd.append("-p")
        cmd.append(port)
        cmd.append("-i")
        cmd.append(f"u{interval}")
        cmd.append(host)


    process = subprocess.Popen(
        cmd, 
        # ["hping3", "-S", "-p", "8000", "-c", "10000", "-i", "u1000", "proxy"],
        # stdout=subprocess.PIPE,
        # stderr=subprocess.STDOUT
    )
    RUNNING_PROCESS = process
    # for line in process.stdout:
        # logger.info(line.rstrip())
    RUNNING_PROCESS.wait()


def start_hping3():
    global RUNNING_PROCESS
    if RUNNING_PROCESS:
        return False
    
    thread = threading.Thread(
        target=run_hping3,
        daemon=True
    )
    thread.start()

    return True

def stop_hping3():
    global RUNNING_PROCESS
    if not RUNNING_PROCESS:
        return False
    
    RUNNING_PROCESS.terminate()
    RUNNING_PROCESS.wait(timeout=5)

    RUNNING_PROCESS = None
    return True


