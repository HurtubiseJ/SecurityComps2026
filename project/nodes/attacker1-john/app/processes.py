
import subprocess
import threading
# wrk -t12 -c400 -d30s http://127.0.0.1:8080/index.html


RUNNING_PROCESS = None

def start_wrk():
    global RUNNING_PROCESS
    if RUNNING_PROCESS:
        return False
    
    thread = threading.Thread(
        target=run_wrk(),
        # daemon=True
    )
    thread.start()

    return True

def stop_wrk():
    global RUNNING_PROCESS
    if not RUNNING_PROCESS:
        return False
    
    RUNNING_PROCESS.terminate()
    RUNNING_PROCESS.wait(timeout=5)
    RUNNING_PROCESS = None

    return True



def run_wrk():
    global RUNNING_PROCESS

    process = subprocess.Popen(
        ['wrk', '-t6', '-c200', '-d60s', 'http://proxy:8000/api/test'],
    )

    RUNNING_PROCESS = process
    RUNNING_PROCESS.wait()

