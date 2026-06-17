# Graph Report - NYN_academy  (2026-06-17)

## Corpus Check
- 37 files · ~16,364 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 205 nodes · 338 edges · 13 communities (11 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `71d1cfa6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `formatInIST()` - 12 edges
3. `supabase` - 11 edges
4. `NYN Academy — Tuition Centre Admin Dashboard` - 10 edges
5. `EmptyState()` - 6 edges
6. `ModalOrDrawer()` - 5 edges
7. `Pagination()` - 5 edges
8. `useDebouncedValue()` - 5 edges
9. `scripts` - 4 edges
10. `getFaculty()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `FacultyPage()` --calls--> `useDebouncedValue()`  [EXTRACTED]
  src/pages/FacultyPage.tsx → src/hooks/useDebouncedValue.ts
- `SchedulePage()` --calls--> `formatInIST()`  [EXTRACTED]
  src/pages/SchedulePage.tsx → src/lib/dateUtils.ts
- `WeekDropDay()` --calls--> `formatInIST()`  [EXTRACTED]
  src/pages/SchedulePage.tsx → src/lib/dateUtils.ts
- `getTodaySchedules()` --calls--> `formatInIST()`  [EXTRACTED]
  src/api/schedules.ts → src/lib/dateUtils.ts
- `markSchedule()` --calls--> `formatInIST()`  [EXTRACTED]
  src/api/schedules.ts → src/lib/dateUtils.ts

## Import Cycles
- None detected.

## Communities (13 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (24): createLead(), getLeads(), updateLead(), createSocialPost(), getSocialPosts(), updateSocialPost(), empty, empty (+16 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (22): 1. Data Fetching and Mutations, 2. Styling Rules, 3. Component Architecture, 🤝 Coding Standards & Context for AI Assistants, ✨ Core Features, Core Frontend Stack, Custom Database Functions (RPC), Custom Utility Class Shortcuts (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.16
Nodes (12): PaginationInput, ProtectedRoute(), useTheme(), AdminLayout(), nav, supabase, DashboardPage(), FacultyPage() (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.25
Nodes (8): devDependencies, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom, typescript, vite, @vitejs/plugin-react

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (15): pagedQuery(), createStudent(), deleteStudent(), getStudents(), listStudentsSimple(), StudentFilters, updateStudent(), useDebouncedValue() (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.18
Nodes (19): createSchedule(), deleteSchedule(), getPastSchedules(), getSchedulesByRange(), getTodaySchedules(), markSchedule(), updateSchedule(), formatInIST() (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.17
Nodes (11): createFaculty(), deleteFaculty(), facultyStats(), getFaculty(), updateFaculty(), emptyForm, SUBJECT_COLORS, Faculty (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (24): dependencies, clsx, date-fns, @dnd-kit/core, @hookform/resolvers, lucide-react, react, react-dom (+16 more)

### Community 9 - "Community 9"
Cohesion: 0.24
Nodes (6): applyTheme(), Theme, queryClient, router, App(), storedTheme

## Knowledge Gaps
- **86 isolated node(s):** `name`, `private`, `version`, `description`, `type` (+81 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `Community 2` to `Community 0`, `Community 5`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _86 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.10416666666666667 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `Community 8` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._