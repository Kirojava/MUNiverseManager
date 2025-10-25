# MUN Manager - Model United Nations Management Software

## Overview
A comprehensive web application for managing Model United Nations conferences. Built with React, TypeScript, and Express, featuring a modern dark-themed interface designed for efficient conference administration.

## Purpose
MUN Manager streamlines all aspects of running a Model United Nations conference, from delegate registration and committee management to logistics coordination and sponsorship tracking.

## Key Features

### 1. Dashboard
- Real-time conference metrics and statistics
- Quick overview of delegates, committees, tasks, and sponsorships
- Recent updates feed
- Upcoming tasks display
- Trend indicators for key metrics

### 2. Delegate Management
- Complete delegate database with profiles
- Registration tracking (registered, confirmed, checked-in)
- School and committee assignments
- Performance evaluation system with scoring rubrics
- Evaluation history and analytics
- Search and filter capabilities

### 3. Secretariat Team
- Team member directory organized by department
- Position and responsibility tracking
- Contact information management
- Department-based organization

### 4. Committee Management
- Committee creation and tracking
- Topic and agenda management
- Executive board assignments (chairperson, vice-chairperson, rapporteur)
- Session count tracking
- Status monitoring (planning, active, completed)

### 5. Executive Board
- Leadership hierarchy management
- Position definitions and responsibilities
- Reporting structure
- Department assignments
- Contact information

### 6. Task Management
- Task creation with assignments
- Priority levels (high, medium, low)
- Status tracking (pending, in-progress, completed)
- Category-based organization
- Due date tracking
- Assignee management

### 7. Logistics
- Multi-category resource management (venue, supplies, catering, transport, equipment)
- Quantity and cost tracking
- Vendor management
- Budget monitoring
- Status tracking per item
- Category-based tabs for organization

### 8. Marketing & Outreach
- Campaign creation and tracking
- Multi-platform support (Instagram, Facebook, Twitter, LinkedIn, Email, Posters, Website)
- Reach metrics and analytics
- Budget allocation
- Campaign timeline management
- Status monitoring (planning, active, completed)

### 9. Sponsorships
- Sponsor database with tier system (Platinum, Gold, Silver, Bronze)
- Contribution tracking
- Contact management
- Benefits package documentation
- Status tracking (pending, confirmed)
- Total fundraising metrics

### 10. Updates & Changelog
- Real-time update posting
- Category system (general, announcement, change, feature, fix)
- Chronological feed
- Author attribution
- Timestamp tracking

### 11. Awards Management
- Award type creation and management
- Tier-based award ordering (Best Delegate, High Commendation, Special Mention, Verbal Mention, Honorary Mention)
- Auto-assignment of awards based on delegate evaluation scores
- Committee-specific award distribution
- Manual override capability for award assignments
- Force reassignment option for updating existing awards
- Tracking of assignment provenance (assignedBy, timestamp)
- Integration with delegate evaluation system

## Technical Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter
- **UI Components:** Shadcn UI (Radix primitives)
- **Styling:** Tailwind CSS with dark mode support
- **State Management:** TanStack Query (React Query v5)
- **Forms:** React Hook Form with Zod validation
- **Icons:** Lucide React
- **Date Handling:** date-fns

### Backend
- **Runtime:** Node.js with Express
- **Storage:** In-memory storage (MemStorage implementation)
- **Validation:** Zod schemas
- **Type Safety:** Drizzle ORM type inference

### Development
- **Build Tool:** Vite
- **Package Manager:** npm
- **TypeScript:** Strict mode enabled

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Shadcn UI components
│   │   │   ├── app-sidebar.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── pages/
│   │   │   ├── dashboard.tsx
│   │   │   ├── delegates.tsx
│   │   │   ├── secretariat.tsx
│   │   │   ├── committees.tsx
│   │   │   ├── executive-board.tsx
│   │   │   ├── tasks.tsx
│   │   │   ├── logistics.tsx
│   │   │   ├── marketing.tsx
│   │   │   ├── sponsorships.tsx
│   │   │   ├── updates.tsx
│   │   │   └── awards.tsx
│   │   ├── lib/
│   │   │   └── queryClient.ts
│   │   ├── App.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   ├── routes.ts
│   ├── storage.ts
│   └── index.ts
├── shared/
│   └── schema.ts         # Shared type definitions
└── design_guidelines.md  # UI/UX design specifications
```

## Data Models

### Delegates
- Personal information (name, school, email, phone)
- Committee and country assignments
- Registration status
- Performance scores and notes

### Delegate Evaluations
- Scoring criteria: Research, Communication, Diplomacy, Participation
- Comments and feedback
- Evaluator information
- Timestamp tracking

### Secretariat
- Member profiles with positions
- Department organization
- Responsibilities
- Contact information

### Committees
- Committee details and topics
- Agenda documentation
- Executive board members
- Session tracking
- Status monitoring

### Executive Board
- Leadership positions
- Reporting hierarchy
- Department assignments
- Responsibilities documentation

### Tasks
- Task descriptions and assignments
- Priority and status tracking
- Category organization
- Due dates

### Logistics
- Multi-category item tracking
- Quantity and cost management
- Vendor information
- Status tracking

### Marketing Campaigns
- Platform-specific campaigns
- Reach and budget metrics
- Timeline management
- Status tracking

### Sponsorships
- Tier-based sponsor organization
- Contribution amounts
- Contact details
- Benefits packages

### Updates
- Update posts with categories
- Author attribution
- Timestamp tracking
- Content management

### Award Types
- Award name and description
- Order index for ranking priority
- Active/inactive status
- System-wide award definitions

### Delegate Awards
- Delegate and award type linkage
- Committee association
- Assignment tracking (auto vs manual)
- Assignor information
- Timestamp tracking
- Override capability

## Design System

### Theme
- **Primary Mode:** Dark theme by default
- **Color Scheme:** Professional blue accent with high contrast
- **Typography:** Inter for UI, JetBrains Mono for code/IDs
- **Layout:** Sidebar navigation with responsive design

### UI Patterns
- Card-based layouts for data display
- Modal dialogs for data entry
- Tab navigation for categorized content
- Badge indicators for status and categories
- Progress bars for metrics and evaluations
- Responsive grid layouts

### User Experience
- Real-time search and filtering
- Instant status updates
- Visual feedback for actions
- Empty states with helpful messages
- Loading states for async operations
- Toast notifications for confirmations

## Current State
- Full frontend implementation with all 11 modules (including Awards)
- Complete type system with Zod validation
- In-memory data storage with full CRUD operations
- Responsive dark-themed UI
- All CRUD forms and displays implemented
- Awards system with auto-assignment logic operational

## Recent Changes (October 25, 2025)
- Added comprehensive awards management system with auto-assignment based on evaluations
- Implemented award types and delegate awards tables with full CRUD
- Created storage layer with auto-assign logic using evaluation scores
- Built Awards UI with tabs for award types and delegate awards management
- Added force override and manual assignment capabilities
- Integrated awards navigation in sidebar
- Set up routing for all modules
- Configured dark theme with theme toggle
- Designed comprehensive data models

## Next Steps (Future Enhancements)
1. Add automated tests for awards auto-assignment logic
2. Implement assignment provenance display in UI
3. Consider PostgreSQL for persistent storage if needed
4. Add bulk operations for delegate management
5. Implement export functionality for reports and awards
6. Add email notifications for award recipients

## User Preferences
- Dark theme preferred
- Modern, professional aesthetic
- Information-dense layouts
- Quick access to all features
- Comprehensive data tracking
