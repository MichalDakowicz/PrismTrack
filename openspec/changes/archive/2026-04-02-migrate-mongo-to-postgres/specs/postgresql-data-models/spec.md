## ADDED Requirements

### Requirement: Projects Table Schema
The system SHALL persist project records in PostgreSQL with a defined schema supporting projects, workspaces, and linked repositories.

#### Scenario: Project storage structure
- **WHEN** a project is created in the system
- **THEN** it is stored in the `projects` table with columns: id (UUID/Serial), workspaceId, name, description, status, linkedRepositories (JSONB), createdAt, updatedAt

#### Scenario: Linked repositories array persistence
- **WHEN** a project has associated repository links
- **THEN** the linkedRepositories field stores an array of repository objects (id, full_name, name, html_url) as JSONB

#### Scenario: Project timestamps
- **WHEN** a project is created or updated
- **THEN** createdAt and updatedAt are automatically set to ISO 8601 timestamps

### Requirement: Projects Table Indexes
The system SHALL maintain indexes on frequently queried fields for performance.

#### Scenario: Workspace and update time index
- **WHEN** listing projects for a workspace
- **THEN** the query uses the (workspaceId, updatedAt DESC) index for efficient sorting

#### Scenario: Workspace and repository lookup index
- **WHEN** querying projects linked to a specific repository
- **THEN** the query uses the (workspaceId, linkedRepositories.full_name) index

### Requirement: Project Status Values
The system SHALL enforce that projects can only have specific valid status values.

#### Scenario: Valid project statuses
- **WHEN** a project is created or updated
- **THEN** its status must be one of: "planned", "active", "archived"

#### Scenario: Default project status
- **WHEN** a project is created without explicit status
- **THEN** the default status is "active"

### Requirement: Data Type Compatibility
The system SHALL ensure compatibility between MongoDB's data types and PostgreSQL representations.

#### Scenario: String fields mapping
- **WHEN** storing project name, description, repository names, and URLs
- **THEN** all are stored as PostgreSQL TEXT/VARCHAR fields

#### Scenario: ObjectId replacement strategy
- **WHEN** MongoDB ObjectIds need to be stored in PostgreSQL
- **THEN** use string UUIDs or serial integers as primary keys

#### Scenario: JSONB for complex nested structures
- **WHEN** linkedRepositories array contains multiple fields per repository
- **THEN** store as JSONB column to maintain query flexibility on repository fields
