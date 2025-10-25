# MUN Management Software - Design Guidelines

## Design Approach

**Selected Approach:** Hybrid - Design System + Reference-Based  
**Primary References:** Linear (modern dashboard aesthetics), Notion (database views), Asana (task management)  
**Design System Foundation:** Material Design 3 (for dark theme patterns and component architecture)  
**Justification:** This utility-focused platform requires robust information architecture while maintaining modern aesthetics. Linear's clean dark UI combined with Notion's flexible data views provides the perfect foundation for a sophisticated MUN management system.

## Core Design Principles

1. **Information Density with Clarity** - Pack substantial data without overwhelming users
2. **Hierarchical Navigation** - Multi-level access to complex interconnected modules
3. **Dark-First Design** - Optimized for extended use with reduced eye strain
4. **Contextual Awareness** - Always show users where they are in the system
5. **Action-Oriented** - Quick access to common tasks from any view

## Typography System

**Font Families:**
- Primary: Inter (via Google Fonts) - Interface text, data displays
- Monospace: JetBrains Mono - Code, IDs, technical references

**Type Scale:**
- Mega Headers: text-4xl font-bold (Module headers, dashboard titles)
- Section Headers: text-2xl font-semibold (Database sections, committee names)
- Subsection Headers: text-xl font-medium (Cards, list groups)
- Body Large: text-base font-medium (Primary content, labels)
- Body Regular: text-sm (Standard content, descriptions)
- Body Small: text-xs (Metadata, timestamps, secondary info)
- Micro: text-[10px] (Badges, status indicators)

## Layout System

**Spacing Primitives:** Tailwind units of 1, 2, 4, 6, 8, 12, 16  
**Container Strategy:**
- Dashboard wrapper: Full viewport with fixed sidebar
- Content areas: max-w-7xl with px-6 py-8
- Cards/Panels: p-6 for content, p-4 for compact views
- Lists: py-3 px-4 for items, gap-2 between rows

**Grid Systems:**
- Dashboard: 3-column for stats/metrics (grid-cols-1 md:grid-cols-3)
- Database views: 2-column split for filters + content (grid-cols-4, content spans 3)
- Forms: 2-column for efficiency (grid-cols-1 md:grid-cols-2)
- Card grids: 3-4 columns for delegates/committees (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

## Navigation Architecture

**Primary Navigation (Left Sidebar - Fixed, w-64):**
- Dashboard (overview metrics)
- Delegates (database, marking system)
- Secretariat (team, positions, hierarchy)
- Committees (agendas, sessions, tracking)
- Executive Board (positions, responsibilities)
- Tasks & Assignments
- Logistics (venue, supplies, scheduling)
- Marketing & Outreach
- Sponsorships
- Updates & Changelog

**Secondary Navigation (Top Bar - Sticky):**
- Conference selector/switcher
- Global search
- Quick actions dropdown
- Notifications bell
- User profile menu

**Tertiary Navigation (Context Tabs):**
- Within each module, horizontal tabs for views (e.g., Delegates: All / By Committee / By School)

## Component Library

### Core Components

**Cards/Panels:**
- Standard Card: rounded-lg border with subtle shadow, p-6
- Compact Card: p-4 for dense information
- Interactive Card: Hover state with subtle lift effect
- Stat Card: Large number display with trend indicator

**Data Tables:**
- Sticky header row with sort indicators
- Alternating row treatment for readability
- Row hover states
- Inline actions (edit, view, delete icons)
- Bulk selection checkboxes
- Pagination at bottom

**Forms:**
- Grouped field sets with subtle dividers
- Inline validation states
- Helper text below inputs
- Required field indicators
- Multi-step forms with progress indicator

**Badges & Status:**
- Pill-shaped badges for delegate status, committee assignments
- Dot indicators for online/offline, task status
- Priority flags (High/Medium/Low) with visual weight

### Navigation Components

**Sidebar Items:**
- Icon + Label layout
- Active state with accent indicator (left border or background)
- Nested items with indentation
- Collapse/expand for sub-sections

**Breadcrumbs:**
- Text-sm with separators
- Last item emphasized
- Clickable history

**Tabs:**
- Underline style for active state
- Equal-width or auto-width based on content

### Data Display Components

**Delegate Cards:**
- Profile photo (circular, 48px)
- Name, School, Committee assignment
- Status badge
- Quick actions (view profile, message, mark)

**Committee Views:**
- Header with committee name, topic, status
- Agenda list with session times
- Delegate roster with grid layout
- Activity timeline

**Task Cards:**
- Priority indicator (colored left border)
- Assignee avatars (overlapping, max 3 + count)
- Due date with urgency coloring
- Status dropdown
- Subtask count

**Marking System:**
- Criteria grid with scoring inputs
- Running total calculator
- Comment sections
- Historical scores comparison

### Forms & Inputs

**Input Fields:**
- Consistent height (h-10 for standard, h-12 for emphasized)
- Clear focus states with ring
- Prefix/suffix icons where relevant
- Error states with red accent

**Selects & Dropdowns:**
- Native select styling enhanced with custom arrow
- Multi-select with tag pills
- Searchable dropdowns for large datasets

**Date/Time Pickers:**
- Calendar overlay for date selection
- Time input with AM/PM toggle
- Range selection for scheduling

### Dashboard Widgets

**Metrics Overview:**
- 4-column grid of key stats
- Large number + label + trend indicator
- Icon representing metric category

**Recent Activity Feed:**
- Timeline layout with timestamps
- User avatars for actions
- Categorized by type (delegate joined, task completed, etc.)

**Quick Actions Grid:**
- Icon-first cards linking to common tasks
- "Add Delegate", "Create Committee", "New Task", etc.

**Progress Trackers:**
- Visual bars for completion percentages
- Conference preparation checklist
- Marketing campaign milestones

### Executive Board Module

**Hierarchy Visualization:**
- Org chart layout for secretary positions
- Expandable nodes
- Contact info on hover

**Position Cards:**
- Position title, holder name, responsibilities
- Direct report count
- Action buttons (contact, reassign)

### Logistics Dashboard

**Resource Tracker:**
- Category tabs (Venue, Supplies, Catering, Transport)
- Inventory lists with quantities
- Budget allocation bars
- Vendor contact cards

**Schedule Grid:**
- Timeline view for conference days
- Color-coded events
- Drag-and-drop (visual only, not functional yet)

### Marketing & Sponsorships

**Campaign Cards:**
- Platform icons (Instagram, Email, Posters)
- Reach metrics
- Status and dates
- Action buttons

**Sponsor Tiers:**
- Tiered list (Platinum, Gold, Silver, Bronze)
- Logo placeholders
- Contribution amounts
- Contact details
- Benefits checklist

## Responsive Behavior

**Desktop (lg+):** Full sidebar + multi-column layouts  
**Tablet (md):** Collapsible sidebar, 2-column max  
**Mobile (base):** Hidden sidebar with hamburger menu, single column, bottom nav for key actions

## Animations

Use sparingly - only for:
- Sidebar collapse/expand
- Modal open/close (fade + scale)
- Dropdown appearance (fade down)
- Toast notifications (slide in from top-right)

NO animations on: Hover states, data updates, page transitions

## Images

**Profile Photos:**
- Delegates: Circular avatars throughout
- Secretariat: Larger photos in profile views
- Sponsors: Logo placeholders (rectangular)

**Dashboard:**
- No hero image - this is a management tool
- Optional: Conference logo in sidebar header
- Icons throughout for visual navigation cues

**Empty States:**
- Illustration placeholders for empty modules ("No delegates yet", "No tasks assigned")
- Centered with CTA button below