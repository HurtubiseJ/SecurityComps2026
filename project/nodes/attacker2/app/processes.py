import threading
import subprocess
import logging
#IP Spoof sudo hping3 -S -p 80 -a 1.2.3.4 example.com
# Set packecount/interval sudo hping3 -S -p 443 -c 10 -i u1000 example.com
# Trace sudo hping3 -S -p 80 --traceroute example.com

RUNNING_PROCESS = None

logger = logging.getLogger("hping3")

def run_hping3():
    global RUNNING_PROCESS
    process = subprocess.Popen(
        ['hping3', '-S', '-p', '8000', '--flood', 'proxy'], 
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )
    RUNNING_PROCESS = process
    for line in process.stdout:
        logger.info(line.rstrip())
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


