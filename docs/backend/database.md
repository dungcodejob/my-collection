# Database Design - Thiết kế Cơ sở dữ liệu

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Database Schema](#database-schema)
3. [Entity Relationships](#entity-relationships)
4. [Indexing Strategy](#indexing-strategy)
5. [Migration Management](#migration-management)
6. [Data Seeding](#data-seeding)
7. [Performance Optimization](#performance-optimization)
8. [Backup & Recovery](#backup--recovery)

## 🎯 Tổng quan

My Collection sử dụng PostgreSQL làm cơ sở dữ liệu chính với TypeORM làm ORM. Thiết kế database tuân theo các nguyên tắc:

- **Normalization**: Giảm thiểu redundancy
- **Performance**: Tối ưu cho read-heavy workload
- **Scalability**: Hỗ trợ horizontal scaling
- **Data Integrity**: Constraints và foreign keys
- **Audit Trail**: Tracking changes và soft delete

### Database Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Services   │  │ Repositories│  │   Entities  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      TypeORM Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Query Builder│  │ Migrations  │  │ Subscribers │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Tables    │  │   Indexes   │  │  Constraints│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ Database Schema

### Core Tables

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    roles TEXT[] DEFAULT ARRAY['user'],
    preferences JSONB DEFAULT '{}',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Collections table
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50) DEFAULT 'folder',
    is_public BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_user_collection_name UNIQUE(user_id, name, deleted_at)
);

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280',
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_tag_name UNIQUE(user_id, name)
);

-- Bookmarks table
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    favicon TEXT,
    screenshot TEXT,
    tags TEXT[],
    is_favorite BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    visit_count INTEGER DEFAULT 0,
    last_visited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Bookmark-Tag junction table
CREATE TABLE bookmark_tags (
    bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (bookmark_id, tag_id)
);

-- Shared collections table
CREATE TABLE shared_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    shared_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shared_with_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(20) DEFAULT 'read', -- read, write, admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_collection_share UNIQUE(collection_id, shared_with_user_id)
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Import/Export jobs table
CREATE TABLE import_export_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- import, export
    source VARCHAR(50), -- chrome, firefox, safari, etc.
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    file_path TEXT,
    progress INTEGER DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
```

### Indexes

```sql
-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_created_at ON users(created_at);

-- Collections indexes
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_parent_id ON collections(parent_id);
CREATE INDEX idx_collections_user_name ON collections(user_id, name);
CREATE INDEX idx_collections_public ON collections(is_public) WHERE is_public = true;

-- Tags indexes
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_usage_count ON tags(usage_count DESC);

-- Bookmarks indexes
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_collection_id ON bookmarks(collection_id);
CREATE INDEX idx_bookmarks_user_created ON bookmarks(user_id, created_at DESC);
CREATE INDEX idx_bookmarks_user_title ON bookmarks(user_id, title);
CREATE INDEX idx_bookmarks_favorite ON bookmarks(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_bookmarks_archived ON bookmarks(user_id, is_archived);
CREATE INDEX idx_bookmarks_public ON bookmarks(is_public) WHERE is_public = true;
CREATE INDEX idx_bookmarks_url_hash ON bookmarks(md5(url));
CREATE INDEX idx_bookmarks_tags ON bookmarks USING GIN(tags);

-- Full-text search indexes
CREATE INDEX idx_bookmarks_search ON bookmarks USING GIN(
    to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
```

## 🔗 Entity Relationships

### TypeORM Entities

```typescript
// user.entity.ts
@Entity('users')
@Index(['email'])
@Index(['username'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'first_name', nullable: true, length: 100 })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true, length: 100 })
  lastName?: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column('text', { array: true, default: () => "ARRAY['user']" })
  roles: string[];

  @Column('jsonb', { default: {} })
  preferences: Record<string, any>;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Relationships
  @OneToMany(() => Bookmark, bookmark => bookmark.user)
  bookmarks: Bookmark[];

  @OneToMany(() => Collection, collection => collection.user)
  collections: Collection[];

  @OneToMany(() => Tag, tag => tag.user)
  tags: Tag[];

  @OneToMany(() => UserSession, session => session.user)
  sessions: UserSession[];

  // Virtual properties
  @Expose()
  get fullName(): string {
    return [this.firstName, this.lastName].filter(Boolean).join(' ');
  }

  @Expose()
  get isAdmin(): boolean {
    return this.roles.includes('admin') || this.roles.includes('super_admin');
  }
}

// collection.entity.ts
@Entity('collections')
@Index(['userId', 'name'])
@Index(['userId', 'createdAt'])
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ length: 7, default: '#3B82F6' })
  color: string;

  @Column({ length: 50, default: 'folder' })
  icon: string;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @ManyToOne(() => User, user => user.collections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @ManyToOne(() => Collection, collection => collection.children, { 
    nullable: true,
    onDelete: 'SET NULL' 
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: Collection;

  @Column('uuid', { name: 'parent_id', nullable: true })
  parentId?: string;

  @OneToMany(() => Collection, collection => collection.parent)
  children: Collection[];

  @OneToMany(() => Bookmark, bookmark => bookmark.collection)
  bookmarks: Bookmark[];

  @OneToMany(() => SharedCollection, shared => shared.collection)
  sharedWith: SharedCollection[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Virtual properties
  @Expose()
  get bookmarkCount(): number {
    return this.bookmarks?.length || 0;
  }

  @Expose()
  get childrenCount(): number {
    return this.children?.length || 0;
  }

  @Expose()
  get isShared(): boolean {
    return this.sharedWith?.length > 0;
  }
}

// bookmark.entity.ts
@Entity('bookmarks')
@Index(['userId', 'createdAt'])
@Index(['userId', 'title'])
@Index(['userId', 'isFavorite'])
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  title: string;

  @Column('text')
  url: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('text', { nullable: true })
  favicon?: string;

  @Column('text', { nullable: true })
  screenshot?: string;

  @Column('text', { array: true, nullable: true })
  tags?: string[];

  @Column({ name: 'is_favorite', default: false })
  isFavorite: boolean;

  @Column({ name: 'is_archived', default: false })
  isArchived: boolean;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'visit_count', default: 0 })
  visitCount: number;

  @Column({ name: 'last_visited_at', nullable: true })
  lastVisitedAt?: Date;

  @ManyToOne(() => User, user => user.bookmarks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @ManyToOne(() => Collection, collection => collection.bookmarks, { 
    nullable: true,
    onDelete: 'SET NULL' 
  })
  @JoinColumn({ name: 'collection_id' })
  collection?: Collection;

  @Column('uuid', { name: 'collection_id', nullable: true })
  collectionId?: string;

  @ManyToMany(() => Tag, tag => tag.bookmarks)
  @JoinTable({
    name: 'bookmark_tags',
    joinColumn: { name: 'bookmark_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tagEntities: Tag[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Virtual properties
  @Expose()
  get domain(): string {
    try {
      return new URL(this.url).hostname;
    } catch {
      return '';
    }
  }

  @Expose()
  get tagCount(): number {
    return this.tagEntities?.length || 0;
  }

  @Expose()
  get isRecentlyAdded(): boolean {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.createdAt > oneDayAgo;
  }
}

// tag.entity.ts
@Entity('tags')
@Index(['userId', 'name'])
@Index(['usageCount'])
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 7, default: '#6B7280' })
  color: string;

  @Column({ name: 'usage_count', default: 0 })
  usageCount: number;

  @ManyToOne(() => User, user => user.tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @ManyToMany(() => Bookmark, bookmark => bookmark.tagEntities)
  bookmarks: Bookmark[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties
  @Expose()
  get bookmarkCount(): number {
    return this.bookmarks?.length || 0;
  }
}
```

## 📊 Indexing Strategy

### Performance Indexes

```sql
-- Composite indexes for common queries
CREATE INDEX idx_bookmarks_user_collection_created 
ON bookmarks(user_id, collection_id, created_at DESC);

CREATE INDEX idx_bookmarks_user_favorite_created 
ON bookmarks(user_id, is_favorite, created_at DESC) 
WHERE is_favorite = true;

CREATE INDEX idx_bookmarks_user_archived_created 
ON bookmarks(user_id, is_archived, created_at DESC);

-- Partial indexes for better performance
CREATE INDEX idx_bookmarks_active 
ON bookmarks(user_id, created_at DESC) 
WHERE deleted_at IS NULL;

CREATE INDEX idx_collections_active 
ON collections(user_id, name) 
WHERE deleted_at IS NULL;

-- GIN indexes for array and JSONB columns
CREATE INDEX idx_bookmarks_tags_gin ON bookmarks USING GIN(tags);
CREATE INDEX idx_users_preferences_gin ON users USING GIN(preferences);

-- Full-text search indexes
CREATE INDEX idx_bookmarks_fts ON bookmarks USING GIN(
    to_tsvector('english', 
        title || ' ' || 
        COALESCE(description, '') || ' ' || 
        array_to_string(tags, ' ')
    )
);
```

### Index Monitoring

```typescript
// index-monitor.service.ts
@Injectable()
export class IndexMonitorService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
  ) {}

  async analyzeIndexUsage(): Promise<IndexUsageStats[]> {
    const query = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_tup_read,
        idx_tup_fetch,
        idx_scan
      FROM pg_stat_user_indexes 
      WHERE schemaname = 'public'
      ORDER BY idx_scan DESC;
    `;

    return this.bookmarkRepository.query(query);
  }

  async findUnusedIndexes(): Promise<UnusedIndex[]> {
    const query = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        pg_size_pretty(pg_relation_size(indexrelid)) as size
      FROM pg_stat_user_indexes 
      WHERE idx_scan = 0 
        AND schemaname = 'public'
      ORDER BY pg_relation_size(indexrelid) DESC;
    `;

    return this.bookmarkRepository.query(query);
  }

  async getSlowQueries(): Promise<SlowQuery[]> {
    const query = `
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements 
      WHERE mean_time > 100
      ORDER BY mean_time DESC
      LIMIT 20;
    `;

    return this.bookmarkRepository.query(query);
  }
}
```

## 🔄 Migration Management

### Migration Structure

```typescript
// 1234567890-initial-schema.ts
export class InitialSchema1234567890 implements MigrationInterface {
  name = 'InitialSchema1234567890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'username',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'avatar_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'roles',
            type: 'text',
            isArray: true,
            default: "ARRAY['user']",
          },
          {
            name: 'preferences',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'IDX_USER_EMAIL',
            columnNames: ['email'],
          },
          {
            name: 'IDX_USER_USERNAME',
            columnNames: ['username'],
          },
          {
            name: 'IDX_USER_ACTIVE',
            columnNames: ['is_active'],
            where: 'is_active = true',
          },
        ],
      }),
    );

    // Create other tables...
    await this.createCollectionsTable(queryRunner);
    await this.createTagsTable(queryRunner);
    await this.createBookmarksTable(queryRunner);
    await this.createJunctionTables(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('bookmark_tags');
    await queryRunner.dropTable('bookmarks');
    await queryRunner.dropTable('tags');
    await queryRunner.dropTable('collections');
    await queryRunner.dropTable('users');
  }

  private async createCollectionsTable(queryRunner: QueryRunner): Promise<void> {
    // Implementation...
  }

  private async createTagsTable(queryRunner: QueryRunner): Promise<void> {
    // Implementation...
  }

  private async createBookmarksTable(queryRunner: QueryRunner): Promise<void> {
    // Implementation...
  }

  private async createJunctionTables(queryRunner: QueryRunner): Promise<void> {
    // Implementation...
  }
}
```

### Migration Best Practices

```typescript
// migration-helper.service.ts
@Injectable()
export class MigrationHelperService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async runMigration(migrationName: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Log migration start
      console.log(`Starting migration: ${migrationName}`);
      
      // Run migration logic here
      
      await queryRunner.commitTransaction();
      console.log(`Migration completed: ${migrationName}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(`Migration failed: ${migrationName}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addIndexConcurrently(
    tableName: string,
    indexName: string,
    columns: string[],
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      
      // Create index concurrently to avoid locking
      const columnList = columns.join(', ');
      await queryRunner.query(
        `CREATE INDEX CONCURRENTLY ${indexName} ON ${tableName} (${columnList})`,
      );
      
      console.log(`Index created: ${indexName} on ${tableName}`);
    } catch (error) {
      console.error(`Failed to create index: ${indexName}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async validateMigration(): Promise<boolean> {
    try {
      // Check if all tables exist
      const tables = await this.dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

      const expectedTables = [
        'users', 'collections', 'tags', 'bookmarks', 
        'bookmark_tags', 'shared_collections', 'user_sessions', 
        'audit_logs', 'import_export_jobs'
      ];

      const existingTables = tables.map(t => t.table_name);
      const missingTables = expectedTables.filter(
        table => !existingTables.includes(table)
      );

      if (missingTables.length > 0) {
        console.error('Missing tables:', missingTables);
        return false;
      }

      // Check if all indexes exist
      const indexes = await this.dataSource.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public'
      `);

      console.log('Migration validation passed');
      return true;
    } catch (error) {
      console.error('Migration validation failed:', error);
      return false;
    }
  }
}
```

## 🌱 Data Seeding

### Seed Data Structure

```typescript
// database.seeder.ts
@Injectable()
export class DatabaseSeeder {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Collection) private collectionRepository: Repository<Collection>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(Bookmark) private bookmarkRepository: Repository<Bookmark>,
  ) {}

  async seed(): Promise<void> {
    console.log('Starting database seeding...');

    // Seed in order of dependencies
    const users = await this.seedUsers();
    const collections = await this.seedCollections(users);
    const tags = await this.seedTags(users);
    const bookmarks = await this.seedBookmarks(users, collections, tags);

    console.log('Database seeding completed');
  }

  private async seedUsers(): Promise<User[]> {
    const users = [
      {
        email: 'admin@mycollection.com',
        username: 'admin',
        passwordHash: await bcrypt.hash('admin123', 10),
        firstName: 'Admin',
        lastName: 'User',
        roles: ['admin', 'user'],
        isVerified: true,
      },
      {
        email: 'demo@mycollection.com',
        username: 'demo',
        passwordHash: await bcrypt.hash('demo123', 10),
        firstName: 'Demo',
        lastName: 'User',
        roles: ['user'],
        isVerified: true,
      },
    ];

    const savedUsers = [];
    for (const userData of users) {
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        const user = this.userRepository.create(userData);
        savedUsers.push(await this.userRepository.save(user));
        console.log(`Created user: ${userData.email}`);
      } else {
        savedUsers.push(existingUser);
      }
    }

    return savedUsers;
  }

  private async seedCollections(users: User[]): Promise<Collection[]> {
    const collectionsData = [
      {
        name: 'Development',
        description: 'Programming and development resources',
        color: '#3B82F6',
        icon: 'code',
        isDefault: true,
      },
      {
        name: 'Design',
        description: 'UI/UX design inspiration and tools',
        color: '#8B5CF6',
        icon: 'palette',
      },
      {
        name: 'Learning',
        description: 'Educational content and tutorials',
        color: '#10B981',
        icon: 'book',
      },
    ];

    const savedCollections = [];
    for (const user of users) {
      for (const collectionData of collectionsData) {
        const existingCollection = await this.collectionRepository.findOne({
          where: { 
            name: collectionData.name,
            userId: user.id,
          },
        });

        if (!existingCollection) {
          const collection = this.collectionRepository.create({
            ...collectionData,
            userId: user.id,
          });
          savedCollections.push(await this.collectionRepository.save(collection));
        } else {
          savedCollections.push(existingCollection);
        }
      }
    }

    return savedCollections;
  }

  private async seedTags(users: User[]): Promise<Tag[]> {
    const tagsData = [
      { name: 'javascript', color: '#F7DF1E' },
      { name: 'typescript', color: '#3178C6' },
      { name: 'react', color: '#61DAFB' },
      { name: 'angular', color: '#DD0031' },
      { name: 'nodejs', color: '#339933' },
      { name: 'design', color: '#FF6B6B' },
      { name: 'tutorial', color: '#4ECDC4' },
      { name: 'documentation', color: '#45B7D1' },
    ];

    const savedTags = [];
    for (const user of users) {
      for (const tagData of tagsData) {
        const existingTag = await this.tagRepository.findOne({
          where: { 
            name: tagData.name,
            userId: user.id,
          },
        });

        if (!existingTag) {
          const tag = this.tagRepository.create({
            ...tagData,
            userId: user.id,
          });
          savedTags.push(await this.tagRepository.save(tag));
        } else {
          savedTags.push(existingTag);
        }
      }
    }

    return savedTags;
  }

  private async seedBookmarks(
    users: User[],
    collections: Collection[],
    tags: Tag[],
  ): Promise<Bookmark[]> {
    const bookmarksData = [
      {
        title: 'Angular Official Documentation',
        url: 'https://angular.io/docs',
        description: 'Official Angular documentation and guides',
        tags: ['angular', 'documentation'],
        collectionName: 'Development',
      },
      {
        title: 'TypeScript Handbook',
        url: 'https://www.typescriptlang.org/docs/',
        description: 'Complete TypeScript documentation',
        tags: ['typescript', 'documentation'],
        collectionName: 'Development',
      },
      {
        title: 'Figma',
        url: 'https://www.figma.com/',
        description: 'Collaborative design tool',
        tags: ['design'],
        collectionName: 'Design',
        isFavorite: true,
      },
    ];

    const savedBookmarks = [];
    for (const user of users) {
      for (const bookmarkData of bookmarksData) {
        const collection = collections.find(
          c => c.name === bookmarkData.collectionName && c.userId === user.id
        );
        
        const bookmarkTags = tags.filter(
          t => bookmarkData.tags.includes(t.name) && t.userId === user.id
        );

        const existingBookmark = await this.bookmarkRepository.findOne({
          where: { 
            url: bookmarkData.url,
            userId: user.id,
          },
        });

        if (!existingBookmark) {
          const bookmark = this.bookmarkRepository.create({
            title: bookmarkData.title,
            url: bookmarkData.url,
            description: bookmarkData.description,
            tags: bookmarkData.tags,
            isFavorite: bookmarkData.isFavorite || false,
            userId: user.id,
            collectionId: collection?.id,
            tagEntities: bookmarkTags,
          });
          
          savedBookmarks.push(await this.bookmarkRepository.save(bookmark));
        }
      }
    }

    return savedBookmarks;
  }

  async clearDatabase(): Promise<void> {
    console.log('Clearing database...');
    
    // Clear in reverse order of dependencies
    await this.bookmarkRepository.delete({});
    await this.tagRepository.delete({});
    await this.collectionRepository.delete({});
    await this.userRepository.delete({});
    
    console.log('Database cleared');
  }
}
```

## ⚡ Performance Optimization

### Query Optimization

```typescript
// optimized-queries.service.ts
@Injectable()
export class OptimizedQueriesService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
  ) {}

  // Optimized bookmark search with pagination
  async searchBookmarksOptimized(
    userId: string,
    searchTerm: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<Bookmark>> {
    const queryBuilder = this.bookmarkRepository
      .createQueryBuilder('bookmark')
      .select([
        'bookmark.id',
        'bookmark.title',
        'bookmark.url',
        'bookmark.description',
        'bookmark.favicon',
        'bookmark.isFavorite',
        'bookmark.createdAt',
      ])
      .where('bookmark.userId = :userId', { userId })
      .andWhere('bookmark.deletedAt IS NULL');

    // Use full-text search for better performance
    if (searchTerm) {
      queryBuilder.andWhere(
        `to_tsvector('english', bookmark.title || ' ' || COALESCE(bookmark.description, '')) 
         @@ plainto_tsquery('english', :searchTerm)`,
        { searchTerm },
      );
    }

    // Count total without loading all data
    const total = await queryBuilder.getCount();

    // Apply pagination and get results
    const bookmarks = await queryBuilder
      .orderBy('bookmark.createdAt', 'DESC')
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getMany();

    return {
      data: bookmarks,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  // Batch load bookmarks with related data
  async loadBookmarksWithRelations(
    bookmarkIds: string[],
  ): Promise<Bookmark[]> {
    return this.bookmarkRepository
      .createQueryBuilder('bookmark')
      .leftJoinAndSelect('bookmark.collection', 'collection')
      .leftJoinAndSelect('bookmark.tagEntities', 'tags')
      .where('bookmark.id IN (:...ids)', { ids: bookmarkIds })
      .getMany();
  }

  // Efficient tag statistics
  async getTagStatistics(userId: string): Promise<TagStatistics[]> {
    return this.bookmarkRepository
      .createQueryBuilder('bookmark')
      .select('unnest(bookmark.tags)', 'tag')
      .addSelect('COUNT(*)', 'count')
      .where('bookmark.userId = :userId', { userId })
      .andWhere('bookmark.deletedAt IS NULL')
      .groupBy('tag')
      .orderBy('count', 'DESC')
      .limit(50)
      .getRawMany();
  }

  // Bulk operations for better performance
  async bulkUpdateBookmarks(
    bookmarkIds: string[],
    updates: Partial<Bookmark>,
  ): Promise<void> {
    await this.bookmarkRepository
      .createQueryBuilder()
      .update(Bookmark)
      .set(updates)
      .where('id IN (:...ids)', { ids: bookmarkIds })
      .execute();
  }

  async bulkDeleteBookmarks(bookmarkIds: string[]): Promise<void> {
    await this.bookmarkRepository
      .createQueryBuilder()
      .softDelete()
      .where('id IN (:...ids)', { ids: bookmarkIds })
      .execute();
  }
}
```

### Connection Pool Configuration

```typescript
// database.config.ts
export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  // Connection pooling
  extra: {
    max: 20,              // Maximum connections
    min: 5,               // Minimum connections
    acquire: 30000,       // Maximum time to get connection (ms)
    idle: 10000,          // Maximum idle time (ms)
    evict: 1000,          // Eviction run interval (ms)
    
    // Connection validation
    testOnBorrow: true,
    validationQuery: 'SELECT 1',
    
    // Performance settings
    statement_timeout: 30000,
    query_timeout: 30000,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  },
  
  // Query optimization
  cache: {
    type: 'redis',
    options: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
    duration: 300000, // 5 minutes
  },
  
  // Logging
  logging: process.env.NODE_ENV === 'development' ? 'all' : ['error'],
  logger: 'advanced-console',
  
  // Migration settings
  migrations: ['dist/migrations/*.js'],
  migrationsRun: false,
  synchronize: false,
});
```

## 💾 Backup & Recovery

### Backup Strategy

```typescript
// backup.service.ts
@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.sql`;
    const backupPath = path.join(process.cwd(), 'backups', backupFileName);

    try {
      // Ensure backup directory exists
      await fs.ensureDir(path.dirname(backupPath));

      // Create database dump
      const command = `pg_dump ${this.getDatabaseUrl()} > ${backupPath}`;
      await exec(command);

      this.logger.log(`Backup created: ${backupPath}`);
      
      // Compress backup
      const compressedPath = `${backupPath}.gz`;
      await exec(`gzip ${backupPath}`);

      return compressedPath;
    } catch (error) {
      this.logger.error('Backup creation failed:', error);
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  async restoreBackup(backupPath: string): Promise<void> {
    try {
      // Decompress if needed
      if (backupPath.endsWith('.gz')) {
        await exec(`gunzip ${backupPath}`);
        backupPath = backupPath.replace('.gz', '');
      }

      // Restore database
      const command = `psql ${this.getDatabaseUrl()} < ${backupPath}`;
      await exec(command);

      this.logger.log(`Database restored from: ${backupPath}`);
    } catch (error) {
      this.logger.error('Backup restoration failed:', error);
      throw new Error(`Restore failed: ${error.message}`);
    }
  }

  async scheduleBackups(): Promise<void> {
    // Daily backup at 2 AM
    cron.schedule('0 2 * * *', async () => {
      try {
        const backupPath = await this.createBackup();
        await this.uploadToCloud(backupPath);
        await this.cleanOldBackups();
      } catch (error) {
        this.logger.error('Scheduled backup failed:', error);
      }
    });
  }

  private getDatabaseUrl(): string {
    const config = this.configService;
    return `postgresql://${config.get('DB_USERNAME')}:${config.get('DB_PASSWORD')}@${config.get('DB_HOST')}:${config.get('DB_PORT')}/${config.get('DB_NAME')}`;
  }

  private async uploadToCloud(backupPath: string): Promise<void> {
    // Implementation for cloud storage upload (AWS S3, Google Cloud, etc.)
  }

  private async cleanOldBackups(): Promise<void> {
    // Keep only last 30 days of backups
    const backupDir = path.join(process.cwd(), 'backups');
    const files = await fs.readdir(backupDir);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    for (const file of files) {
      const filePath = path.join(backupDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime < thirtyDaysAgo) {
        await fs.remove(filePath);
        this.logger.log(`Removed old backup: ${file}`);
      }
    }
  }
}
```

---

*Tài liệu này cung cấp cái nhìn chi tiết về thiết kế cơ sở dữ liệu của My Collection. Để biết thêm về implementation cụ thể, vui lòng tham khảo source code và các migration files.*