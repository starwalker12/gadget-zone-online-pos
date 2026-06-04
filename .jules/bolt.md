## 2025-02-18 - Optimize job_no generation
**Learning:** Fetching all rows just to find a maximum value creates an N+1 query problem, consuming significant CPU time in JS mapping/reducing and network I/O.
**Action:** Use DB-side sorting (`order(column, { ascending: false })`) and limiting (`limit(1)`) to pull only the necessary item.
