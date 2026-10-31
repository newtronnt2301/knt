# KNT Everyday interface refresh — 31 October 2026

The portal now has a new task-led layout and a shared navy/teal visual language. Classroom, gradebook, attendance, grade entry, exam, learning, results, funds, Talent, Plickers, QR generator and the board-game hub use scoped shared surfaces, readable Thai typography, calmer borders and accessible focus states. Existing links, data controls, storage keys and backend endpoints are retained.

## Performance changes

- Removed decorative starfield work from exam/learning and disabled its startup on results.
- Replaced Tailwind's browser-side compiler on four pages with a committed 44,001-byte stylesheet. The build command is pinned in `scripts/tailwind.config.cjs`.
- Removed duplicate Tailwind startup in Plickers.
- Removed fixed multi-gradient backgrounds and expensive blur from main application surfaces; mobile hover transitions and decorative animations are suppressed.
- Consolidated font requests and made the Thai font load without blocking initial rendering.
- ExcelJS is no longer downloaded at exam entry. It loads when a teacher exports scores, with shared in-flight loading, timeout and retry after failure.
- Updated application cache allowlists and release versions to include the shared UI and new mark without intercepting API requests.
- Fixed the QR generator's grid minimum-content width, which previously expanded a 390px viewport to about 790px.

## Discovered compatibility issue

Plickers loaded npm CommonJS sources directly as browser scripts, causing `module/require is not defined`. It now loads unmodified upstream browser scripts pinned to commit `2203d4b5efb601c39054a341bf04702409699383`. The source URL and license are retained in `assets/vendor/js-aruco/`.

## Validation

- 30 Node tests pass: score draft/sync protections, network/cache behaviour, optional library loading, and synthetic printed-card detection. Marker IDs 1, 15, 42 and 60 decode in all four rotations; a blank image produces no scan.
- Inline scripts in the main edited pages parse; local links and assets checked.
- Browser review includes mobile forms, portal role/search navigation, Classroom, gradebook, grade entry, exam, learning, results, funds, Talent, Plickers and the game hub.
- Two pre-existing test fixtures were brought into line with the production retry-state variable and the updated stylesheet version.

This is not a field Core Web Vitals or FPS benchmark. Simulated viewports do not prove performance on a physical phone. Google Apps Script response time still depends on the existing backend and network. Camera hardware, LINE sharing and live grade writes were not exercised; production student scores were not changed as test data. The proposed new administrative/backend features are separate future work.
