# PaperScout Database Architecture — Phase 2

This document provides a comprehensive guide to the **PaperScout Phase 2 Database Layer** built with **PostgreSQL** and **Prisma ORM**.

---

## 1. Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    User ||--o| ResearchProfile : "has profile"
    User ||--o{ Report : "generates reports for"

    ResearchProfile ||--o{ ResearchProfileInterest : "selects"
    Interest ||--o{ ResearchProfileInterest : "belongs to"

    Paper ||--o{ PaperInterest : "tagged with"
    Interest ||--o{ PaperInterest : "associated with"

    Paper ||--o{ ReportPaper : "included in"
    Report ||--o{ ReportPaper : "contains"

    Paper ||--o{ ResearchGap : "has gaps"
    Paper ||--o{ ResearchIdea : "has ideas"

    User {
        string id PK
        string name
        string email UK
        string passwordHash
        datetime createdAt
        datetime updatedAt
    }

    ResearchProfile {
        string id PK
        string userId FK, UK
        string academicField
        enum researchLevel
        string researchContext
        json researchGoals
        enum deliveryFrequency
        int papersPerDigest
        datetime createdAt
        datetime updatedAt
    }

    Interest {
        string id PK
        string name
        string slug UK
        string category
        string description
        datetime createdAt
        datetime updatedAt
    }

    Paper {
        string id PK
        string title
        string abstract
        json authors
        string journal
        string conference
        datetime publicationDate
        string doi UK
        string url
        string source
        int citationCount
        string externalId
        string summary
        string methodology
        string keyFindings
        string limitations
        datetime createdAt
        datetime updatedAt
    }

    Report {
        string id PK
        string userId FK
        string title
        string summary
        enum status
        datetime generatedAt
        datetime createdAt
        datetime updatedAt
    }
```

---

## 2. Enums & Data Types

| Enum | Options | Description |
| :--- | :--- | :--- |
| `ResearchLevel` | `UNDERGRADUATE`, `GRADUATE`, `PHD`, `RESEARCHER`, `PROFESSIONAL` | User academic experience level |
| `DeliveryFrequency` | `EVERY_2_DAYS`, `EVERY_3_DAYS`, `WEEKLY` | Automated research digest delivery interval |
| `ReportStatus` | `DRAFT`, `GENERATING`, `COMPLETED`, `FAILED` | State tracking for digest generation |
| `DifficultyLevel` | `EASY`, `MODERATE`, `ADVANCED` | Research direction difficulty score |
| `NoveltyLevel` | `LOW`, `MEDIUM`, `HIGH` | Novelty assessment score for generated ideas |

---

## 3. Core Models & Relational Join Tables

### `User` & `ResearchProfile`
- **One-to-One Relationship**: Each user is uniquely linked to a `ResearchProfile` via `userId`.
- **Constraint**: `email` is indexed and enforces uniqueness (`@unique`).

### `Interest` & `ResearchProfileInterest`
- **Many-to-Many Relationship**: Explicit join model `ResearchProfileInterest` connects profiles to monitored academic topics.
- **Constraint**: Unique composite key `[researchProfileId, interestId]` prevents duplicate topic links.

### `Paper` & `PaperInterest`
- **Many-to-Many Relationship**: Join table `PaperInterest` links academic papers to interest topics and stores `relevanceScore` (0.0 to 1.0).
- **Deduplication**: Indexed by `doi`, `externalId`, `publicationDate`, and `source`.

### `Report` & `ReportPaper`
- **Digest Composition**: `ReportPaper` preserves digest ordering using the `position` column (1, 2, 3...). Enables querying paper historical appearances over time.

### `ResearchGap` & `ResearchIdea`
- **Future AI Support**: Standalone models linked to `Paper` storing empirical research gaps and novel thesis directions.

---

## 4. Database Commands & Developer Experience

Useful package scripts defined in `package.json`:

```bash
# Run database migrations
npm run db:migrate

# Seed database with initial interests, demo user, papers & report
npm run db:seed

# Launch visual Prisma Studio interface
npm run db:studio

# Re-generate Prisma Client types
npm run db:generate
```

---

## 5. Environment Configuration

Define connection credentials in `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/paperscout?schema=public"
```

Refer to `.env.example` for environment variable templates.
