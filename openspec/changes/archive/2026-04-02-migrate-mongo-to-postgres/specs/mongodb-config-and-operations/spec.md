## REMOVED Requirements

### Requirement: Environment Configuration Contract
**Reason**: MongoDB environment variables (MONGODB_URI, MONGODB_DB_NAME) are being replaced by PostgreSQL environment variables (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD). Configuration validation pattern remains; variables change.

**Migration**:
- Remove MONGODB_URI, MONGODB_DB_NAME, and MongoDB-specific timeout environment variables from configuration
- Add DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD parsing in PostgreSQL config
- Configuration validation interface remains the same; update validation logic for new variables
- See `postgresql-config-and-operations` spec for PostgreSQL configuration requirements

### Requirement: Operational Safety Defaults
**Reason**: MongoDB-specific timeout defaults (connectTimeoutMS, socketTimeoutMS, serverSelectionTimeoutMS) are being replaced by PostgreSQL-specific pool configuration (idle timeout, connection timeout).

**Migration**:
- Remove MongoDB client option defaults from configuration
- Apply equivalent PostgreSQL pool defaults (connectionTimeoutMillis, idleTimeoutMillis)
- Graceful shutdown logic pattern remains; update to close PostgreSQL pool instead of MongoDB client

### Requirement: Deployment and Local Development Readiness
**Reason**: MongoDB setup guidance is being replaced by PostgreSQL setup guidance. The concept of environment-specific setup remains.

**Migration**:
- Update project setup documentation from MongoDB instructions to PostgreSQL instructions
- Update deployment preflight checks to validate PostgreSQL configuration instead of MongoDB
- Update CI/CD test database provisioning from MongoDB test instance to PostgreSQL test instance
