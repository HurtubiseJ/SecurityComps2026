
local status_codes = {}

response = function(status, headers, body)
    status_codes[status] = (status_codes[status] or 0) + 1
end

done = function(summary, latency, requests)

    print("\n===== HTTP Status Codes =====")
    for code, count in pairs(status_codes) do
        print(code .. ": " .. count)
    end

    print("\n===== Summary =====")
    print("Duration (us): " .. summary.duration)
    print("Total Requests: " .. summary.requests)
    print("Total Bytes: " .. summary.bytes)

    print("\n===== Errors =====")
    print("Connect: " .. summary.errors.connect)
    print("Read: " .. summary.errors.read)
    print("Write: " .. summary.errors.write)
    print("Status(>399): " .. summary.errors.status)
    print("Timeout: " .. summary.errors.timeout)

    print("\n===== Latency =====")
    print("Min: " .. latency.min)
    print("Max: " .. latency.max)
    print("Mean: " .. latency.mean)
    print("Stdev: " .. latency.stdev)
    print("P99: " .. latency:percentile(99.0))
end