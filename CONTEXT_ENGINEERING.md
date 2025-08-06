# Context Engineering for TypeMate Project

## 🚨 Critical Safety Rules

### Database Management

**WARNING: Database changes can be destructive and must be handled with extreme care!**

#### Safety Protocols:

1. **Pre-Change Checklist**
   - [ ] Backup verification completed
   - [ ] Migration impact analysis documented
   - [ ] Rollback plan prepared
   - [ ] Test data prepared for validation

2. **Prohibited Actions Without Explicit Permission**
   - ❌ Table deletion or dropping
   - ❌ Column deletion or type changes
   - ❌ Direct production data manipulation
   - ❌ Schema changes without migration scripts
   - ❌ Index removal without performance analysis

3. **Required Approval Process**
   - All database schema changes must be:
     1. Documented with reasoning
     2. Tested in development environment
     3. Reviewed by user before execution
     4. Applied with migration scripts (never direct SQL)

4. **Change Execution Order**
   - Development → Staging → Production
   - Each stage requires full testing
   - Production changes only after user confirmation

### Current Database State Concerns

As of January 2025, the database is in a potentially fragile state due to recent modifications:
- Multiple encryption/decryption attempts
- Schema changes for harmonic features
- Potential data inconsistencies from migration issues

**ALWAYS** verify current state before making ANY changes.

## Project Architecture

### Core Technologies
- Next.js 15.4.2 with App Router
- TypeScript
- Supabase (PostgreSQL)
- Tailwind CSS
- React 19

### Key Features
1. TypeMate 64-type personality system
2. AI chat with personalized responses
3. Harmonic AI integration (astrology + numerology)
4. End-to-end encryption for chat messages
5. Relationship tracking and memory system

### Directory Structure
```
typemate/
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   ├── lib/          # Utility functions and services
│   ├── hooks/        # Custom React hooks
│   └── types/        # TypeScript type definitions
├── public/           # Static assets
└── supabase/        # Database migrations
```

### Critical Files
- `/src/lib/supabase-simple.ts` - Database client
- `/src/lib/memory-manager.ts` - Chat history encryption
- `/src/hooks/useUnifiedChat.ts` - Core chat functionality
- `/src/app/chat/page.tsx` - Main chat interface
- `/src/app/api/chat/route.ts` - Chat API endpoint

### Known Issues and Sensitivities
1. Encryption state must remain consistent
2. User authentication required for all features
3. AI personality selection affects entire chat experience
4. Memory system depends on proper encryption key management

### Development Guidelines
1. Always use TypeScript strict mode
2. Follow existing code patterns
3. Test all changes with multiple user types
4. Verify encryption/decryption works correctly
5. Check console for any security warnings

### Emergency Procedures
If database issues occur:
1. Stop all write operations immediately
2. Check Supabase dashboard for error logs
3. Verify data integrity before proceeding
4. Contact user for guidance on recovery approach

## Remember: When in doubt, ASK before making database changes!