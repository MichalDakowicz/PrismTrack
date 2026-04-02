## REMOVED Requirements

### Requirement: Persisted Domain Models
**Reason**: MongoDB BSON persistence model is being replaced by relational PostgreSQL table structure. Data model concepts (projects, repositories) remain; storage format and schema change.

**Migration**:
- Replace MongoDB document-based project storage with PostgreSQL table-based storage
- Projects remain an entity with identity, metadata, status, and linked repository references
- Structure changes from MongoDB documents to PostgreSQL rows with typed columns
- linkedRepositories array changes from MongoDB nested array to PostgreSQL JSONB column
- See `postgresql-data-models` spec for PostgreSQL schema and requirements

### Requirement: Repository Layer Contract
**Reason**: MongoDB collection operations are being replaced by PostgreSQL query operations. Repository interface contract remains unchanged.

**Migration**:
- Keep `ProjectRepository` interface unchanged; it abstracts storage mechanism
- Replace `MongoProjectRepository` implementation with `PostgresProjectRepository`
- Repository interface consumers (route handlers) require NO changes
- Both implementations will continue following same contract: create, read, update, list operations

### Requirement: Data Integrity Guards
**Reason**: MongoDB validation operations are being replaced by PostgreSQL validation and constraints. Data validation concepts remain; implementation mechanism changes.

**Migration**:
- Move validation logic from application layer to PostgreSQL NOT NULL and ENUM constraints where appropriate
- Invalid project payload rejection behavior remains the same from application perspective
- linkedRepositories normalization continues at repository layer before database write
- PostgreSQL schema provides additional integrity via table constraints (NOT NULL, CHECK, UNIQUE)
