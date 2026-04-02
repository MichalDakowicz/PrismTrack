## ADDED Requirements

### Requirement: PostgreSQL Credentials from Environment
The system SHALL parse PostgreSQL connection credentials from environment variables and validate their presence.

#### Scenario: Reading PostgreSQL credentials from .env
- **WHEN** the application starts
- **THEN** it reads DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD from environment variables

#### Scenario: Validation of required PostgreSQL configuration
- **WHEN** the application attempts to initialize the database
- **THEN** it validates that all required PostgreSQL credentials are present and non-empty (unless in-memory mode)

#### Scenario: Connection string construction
- **WHEN** PostgreSQL credentials are validated
- **THEN** the system constructs a valid PostgreSQL connection string (host:port/dbname with user/password)

### Requirement: Database Configuration Validation
The system SHALL validate PostgreSQL configuration and report errors appropriately based on environment (development vs. production).

#### Scenario: Configuration error in production
- **WHEN** running in production (NODE_ENV=production) with invalid PostgreSQL configuration
- **THEN** the system throws an error and prevents application startup

#### Scenario: Configuration warning in development
- **WHEN** running in development with invalid PostgreSQL configuration
- **THEN** the system logs a warning but may allow startup with degraded database functionality

#### Scenario: Retry logic for temporary connection failures
- **WHEN** the initial PostgreSQL connection fails with a transient error
- **THEN** the system retries connection establishment with configurable exponential backoff

### Requirement: PostgreSQL Schema Initialization
The system SHALL automatically create and initialize the PostgreSQL schema on first run.

#### Scenario: Automatic table creation
- **WHEN** the application starts and connects to PostgreSQL
- **THEN** the system checks for existence of required tables (projects) and creates them if missing

#### Scenario: Automatic index creation
- **WHEN** tables are initialized or on application startup
- **THEN** the system ensures required indexes exist (workspace_updatedAt, workspace_linkedRepositories_full_name)

### Requirement: In-Memory Repository Fallback
The system MAY support in-memory project repository as a fallback when PostgreSQL is unavailable (for development/testing).

#### Scenario: In-memory fallback when PostgreSQL unavailable
- **WHEN** PostgreSQL connection fails and ALLOW_IN_MEMORY_PROJECT_REPO_FALLBACK=true in development
- **THEN** the system falls back to in-memory repository to allow continued operation

#### Scenario: No fallback in production
- **WHEN** running in production (NODE_ENV=production)
- **THEN** the system does not allow in-memory repository fallback regardless of configuration
