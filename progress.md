## Frontend UI/UX design & API integration:

- Moved from Bootstrap UI to material UI for to bring more component style

### Dashboard:

- Dashboard with search for program lookup
- Dashboard search program overview with multi widget style

### Program:

- New Program Component
- Edit Program Component with Multi Review dropdown widget control
  - Program view / toggleable edit component which populates data from pgm_info, [UserAccess_pgm_info], [pgm_perm] tables
  - Assigned Users grid component
  - Add user Popup Component with unassigned users/contacts, area of responsibility
- Save or update Program Service integrated
- Component of Program Review view with data based on the review selected

  - Compliance plan reminder popup component with Add reminder form
  - Metadata popup component with miscellaneous fields addition , update option
  - User auto suggession control component on Allow Reviews By Users

- Program Review view - Master Document list Component
  - Document list Grid component
  -

## API Development with DB:

- Program Lookup API
- Review Types API
- Review Type Detail Info API
- Review Workflow list API
- Program Review List API
- Program Info detail with Review detail API
- Program Office list API
- Program Office Assigned / unassigned User List API
- Program detail dropdown component Ref Data API
- Program Review Meta data list API
- Program save or update API
- Program Review Save API
- Program Review Meta data Save API
- Program Review Complaince plan save API
- Email Template list API
- Document lookup by program review API
- Complaince Plan Info by Review API
- Complaince Plan Info by Document API
- Master Document view document name list API
- Master Document form master lookup API
- Master Document Flex form data lookup API
- Master Document Questionaire data lookup API

## Queries:

- Plan for Main Authentication process (Token based on session based)?
- Plan for How this program management app needs to be moved under current application?
- Should this app be responsive or support Ipd or iPad pro Tablet resolution?
- The main dashboard view from search program selection, how this should look like?
- General UI feedback, can I continue build on top of this?

## TODOs:

- Sub-recipient Selection Component
- Final Release Program Component
- Design & develop all other review list components
  - "Master document list" Component - WIP
  - "Findings Setup" Component
  - "Findings Rules Setup" Component
  - "Stage Roles Setup" Component
- Showing the sidebar menus as selected and visible based on program info data
- Moving from session based program view to URL param based program view data prepopulation
- Program edit view
  - Based on available reviews, show "customer review type name" toggle button value
  - Add new Review control
- Updating Program View components UI to be in sync
- Review the outcome and queries with leadership
- Complete Regression Test / QA

## Challenges:

- UI design, flow & Planning (How to present the DB data, what all are the data can be shown)
- Current production Application usecases and DB design understanding

## Goal

Building admin friendly UI & flow control of the current app / data model
