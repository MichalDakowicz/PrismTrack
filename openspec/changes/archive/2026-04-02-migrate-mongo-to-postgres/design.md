## Context

PrismTrack currently uses MongoDB for all data persistence via the `MongoProjectRepository`. The database connection is managed by a dedicated `MongoConnectionManager` that handles connection pooling, health checks, and credential management. The current implementation stores projects, repositories, and workspace relationships as BSON documents.

The new PostgreSQL configuration is already available in `.env` (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD), indicating readiness for migration. The data model is fundamentally relational: workspaces contain projects, projects link to repositories, creating natural table relationships that PostgreSQL handles natively with better performance and ACID guarantees.

## Goals / Non-Goals

**Goals:**
- Replace MongoDB with PostgreSQL as the primary data store for all persistence operations
- Maintain backward compatibility with existing API contracts and data models
- Implement PostgreSQL connection pooling with health checks equivalent to MongoDB's
- Migrate all repository implementations (MongoProjectRepository → PostgresProjectRepository)
- Update environment variable resolution to use PostgreSQL credentials
- Ensure all existing tests pass with PostgreSQL

**Non-Goals:**
- Change API contracts or data serialization formats
- Implement advanced PostgreSQL features (partitioning, sharding) beyond basic schema design
- Support simultaneous MongoDB/PostgreSQL operation (full cutover only)
- Backfill historical data or implement data migration scripts (assume clean PostgreSQL deployment)

## Decisions

### Decision 1: Use `pg` Node.js library with connection pooling
**Choice**: Use the `pg` library (node-postgres) with a dedicated Pool for connection management.

**Rationale**: `pg` is the most mature and widely-used PostgreSQL client for Node.js. It provides built-in connection pooling, error handling, and prepared statements (preventing SQL injection). Connection pooling directly mirrors MongoDB's connection manager approach.

**Alternatives Considered**:
- Prisma ORM: Would add abstraction layer and migration complexity
- TypeORM: Similar issues; more infrastructure than needed
- Raw sql: No connection pooling; verbose connection management

### Decision 2: PostgreSQL connection manager mirrors existing MongoDB pattern
**Choice**: Create a `PostgresConnectionManager` with the same interface as `MongoConnectionManager` (connect, getConnection, ping, close, isConnected).

**Rationale**: Minimizes changes to application code that depends on connection management. The abstraction allows for potential future database swaps. Reuses the same patterns and guardrails documented in backend-mongodb-notes.md (connection validation, reconnection retry, concurrent connection guard).

**Alternatives Considered**:
- Direct Pool usage throughout the app: Tighter coupling to PostgreSQL specifics
- Adapter pattern: More boilerplate than needed for this single switch

### Decision 3: Schema: Projects → `projects` table with explicit columns
**Choice**: Create a `projects` table (name, description, status, workspaceId, createdAt, updatedAt) with primary key on id, and indexes on (workspaceId, updatedAt) and (workspaceId, linkedRepositories).

**Rationale**: Flattens MongoDB's nested structure. LinkedRepositories (array of objects) will be stored as JSONB column for compatibility. Indexes match existing MongoDB index strategy. JSONB preserves query flexibility for repository filtering.

**Alternatives Considered**:
- Separate `linked_repositories` table: Adds join complexity; overkill for small object arrays
- Full normalization (separate table): Increases query complexity; JSONB is more practical here

### Decision 4: No data migration tooling; assume clean PostgreSQL
**Choice**: Deploy to fresh PostgreSQL schema without backfill scripts.

**Rationale**: Scope clarification: migration tooling (ETL, rollback procedures) is orthogonal to core replacement. Existing MongoDB data is treated as transitional; fresh deployment is cleaner. If backfill is needed later, it can be a separate effort.

**Alternatives Considered**:
- Implement MongoDB → PostgreSQL ETL: Additional scope; defers clean migration
- Dual-write pattern: Increases implementation complexity

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Connection pool exhaustion in high-load scenarios** | Set reasonable pool defaults (max: 10 connections). Add connection usage monitoring and alerts in production. |
| **JSONB queries for linkedRepositories less efficient than relational table** | Current queries don't require complex filtering on repository arrays. If performance becomes an issue, promotion to separate table is straightforward. |
| **PostgreSQL schema changes require migrations** | Start with simple schema. Use explicit migration approach (SQL files) if future schema changes arise. |
| **Losing MongoDB-specific features (e.g., TTL indexes, aggregation pipeline)** | PrismTrack doesn't currently rely on complex aggregations. TTL is not needed for projects. If needed later, can be implemented via separate cleanup job. |

## Migration Plan

1. **Phase 1 - Setup**: 
   - Add `pg` library to dependencies
   - Create `PostgresConnectionManager` with same interface as current MongoConnectionManager
   - Create PostgresProjectRepository implementing ProjectRepository interface

2. **Phase 2 - Schema**:
   - Define `projects` table schema in SQL
   - Create migration/initialization script to set up schema and indexes
   - Ensure table is created on application startup (via ensureIndexes equivalent)

3. **Phase 3 - Configuration**:
   - Update `backend/config/database.ts` to parse PostgreSQL credentials
   - Create `validateDatabaseConfig` for PostgreSQL
   - Update environment variable resolution (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)

4. **Phase 4 - Cutover**:
   - Switch ProjectRepository factory to instantiate PostgresProjectRepository instead of MongoProjectRepository
   - Remove MongoDB dependencies and MongoConnectionManager
   - Update all tests to use PostgreSQL test instance

5. **Rollback**: If critical issues arise, revert to MongoDB by reversing Phase 4 (keep MongoDB code dormant in feature branch).

## Open Questions

1. Should PostgreSQL credentials support URL-based connection string (like MongoDB's MONGODB_URI) in addition to separate host/port/user/password? → Recommend supporting both for flexibility
2. How should linked repositories array schema evolve if complex querying is needed? → Current JSONB approach; promote to relational table if performance requires it
3. What's the strategy for test database provisioning in CI/CD? → TBD in implementation; can use containerized PostgreSQL (Docker test instance) or managed test database
