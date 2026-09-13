# KNT usability and performance update — 13 September 2026

## Delivered

- Rebuilt the public portal as static HTML with an immediately usable student/teacher shortcut area, search, category filters, local pins and four recent tools. All destinations remain ordinary links when JavaScript is unavailable.
- Kept the original personal-notepad storage key; no existing draft or student data is migrated or deleted.
- Removed the forced 1.8-second boot overlay, decorative temperature, uptime and continuously rendered canvas network.
- Reused all 13 original module icons as 144px WebP derivatives: 1,216,292 bytes of originals versus 44,524 bytes of derivatives (96.3% smaller by file size). Images below the fold load lazily and have explicit dimensions. This is not a measured page-load improvement percentage.
- One font family on the portal, three requested weights, with system fallback.
- Classroom uses quieter surfaces, stronger text, a portal return link, tool search and links to original full tools. Removed the invented teacher timetable and corrected the score shortcut to say it reads scores.
- Portal teacher attendance/work routes open their native Classroom modules with reloadable tool URLs. Full legacy routes remain available inside each module. Student learning/exam/results links continue to open functioning original systems, not demo student dashboards.
- Roster script (113,013 bytes) loads only when required. Attendance shows rooms before the remote subject list finishes. Engineering attendance does not request an unrelated subject list. Work and roster requests start independently.
- Attendance history requires a selected subject instead of automatically fetching all subjects.
- Shared JSON transport bounds reads to 15 seconds and writes to 30 seconds, including reading the body. Concurrent identical reads share a request. Writes are neither deduplicated nor automatically retried. Uncertain writes are not presented as confirmed success.
- Classroom and Talent cache only explicitly allowed same-origin static files, retain one another's caches, use cached static files/shell immediately, and never substitute HTML for failed API/JS responses. Navigations refresh in the background. Existing write-verification and draft protections remain.

## Validation

- 16 Node tests: shared reads, independent writes/no retries, timeout during body read, retry after read failure, isolated cache cleanup, API/write bypass, cached assets, offline missing-script failure, immediate cached navigation (both applications).
- JavaScript syntax and Git whitespace checks.
- Portal link/asset existence check; browser checks of role persistence, pin/filter/search, desktop layout and 390px mobile layout without horizontal overflow.
- Classroom read-only smoke test: real subject list loaded, local roster populated without waiting for the subject response, no console errors observed; history with no selected subject explains the required selection.
- No production attendance, grades or assignment records were written as test data.

## Boundaries and follow-up evidence

- Not a Lighthouse or field Core Web Vitals report. Chrome DevTools performance tooling was unavailable. No LCP/INP/CLS pass is claimed.
- Before implementation, four static downloads from the live site took 0.30–0.39 seconds each from this machine; those numbers are not browser render timings or mobile-network measurements.
- Google Apps Script backend source for the main attendance/work services is not in this checkout. Server-side indexes, pagination, atomic revision control and backend latency changes are not claimed here. Existing API contracts and deployed backend data remain unchanged.
- Individual student accounts/demo data and read-only/incomplete native tools are not converted into fully implemented services by this frontend update. Original full tools are preserved instead of removing functioning features.
- Talent question content, grading and printed-paper snapshots are unchanged; the question bank remains eager within Talent. Level-based splitting requires a separate bank-loading change and validation.
