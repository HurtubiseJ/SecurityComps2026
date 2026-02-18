
import subprocess
import threading
# wrk -t12 -c400 -d30s http://127.0.0.1:8080/index.html


RUNNING_PROCESS = None

def start_wrk(forwardPort: str, forwardHost: str, endPoint: str, num_threads = 6, num_connections = 200, duraition_seconds = 60):
    global RUNNING_PROCESS
    if RUNNING_PROCESS:
        return False
    
    thread = threading.Thread(
        target=run_wrk,
        args=[forwardPort, forwardHost, endPoint, num_threads, num_connections, duraition_seconds]
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



def run_wrk(forwardPort: str, forwardHost: str, endPoint: str, request_rate: int, headers = [], keep_alive = True, method = "GET", num_threads = 6, num_connections = 200, duraition_seconds = 60):
    global RUNNING_PROCESS

    cmd = [
        "wrk",
        "-t", str(num_threads),      # Thread count
        "-c", str(num_connections),  # Connection count
        "-R", str(request_rate),          # Rate limit (required for wrk2)
        "-d", f"{duraition_seconds}",               
        "--timeout", "2s",
        "--latency"
    ]

    for key, value in headers:
        cmd.extend(["-H", f"{key}: {value}"])
    
    if not keep_alive:
        cmd.extend(["-H", "Connection: Close"])
    
    if method != "GET":
        cmd.extend(["-m", method])
    
    cmd.append(f"http://{forwardHost}:{forwardPort}/{endPoint}")
    return cmd

    process = subprocess.Popen(cmd)


    RUNNING_PROCESS = process
    RUNNING_PROCESS.wait()

