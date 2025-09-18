module.exports = {
  coalesce: [
    `You are processing remembered knowledge. Execute this MANDATORY checklist:

1. **MUST READ** .claude/knowledge/session.md - Even if empty
2. **MUST PROCESS** each entry from session.md:
   - Determine category (architecture/patterns/dependencies/workflows/gotchas/etc)
   - **MUST CREATE OR UPDATE** appropriate file in .claude/knowledge/{category}/
   - Keep dated entries only for gotchas
3. **MUST UPDATE OR CREATE** BOTH knowledge maps:
   - **KNOWLEDGE_MAP.md** (user-facing): Use markdown links like [Topic Name](path/file.md)
   - **KNOWLEDGE_MAP_CLAUDE.md** (Claude-facing): Use RELATIVE @ references like @patterns/file.md or @gotchas/file.md (NOT full paths)
   - Both maps should have identical structure, just different link formats
   - Include last updated timestamps in user-facing map only
4. **MUST CLEAR** session.md after processing - use Write tool with empty content

**VERIFICATION CHECKLIST - ALL MUST BE TRUE:**
- [ ] Read session.md (even if empty)
- [ ] Created/updated .claude/knowledge/ category files for any new knowledge
- [ ] Created/updated BOTH KNOWLEDGE_MAP.md (markdown links) and KNOWLEDGE_MAP_CLAUDE.md (@ references)
- [ ] Verified no knowledge was lost in the transfer
- [ ] Cleared session.md by writing empty content to it

**IF YOU SKIP ANY STEP, YOU HAVE FAILED THE TASK**

IMPORTANT: CLAUDE.md uses @ references to .claude/knowledge/INSTRUCTIONS.md and .claude/knowledge/KNOWLEDGE_MAP_CLAUDE.md
IMPORTANT: KNOWLEDGE_MAP_CLAUDE.md uses RELATIVE @ references (e.g., @patterns/file.md NOT @.claude/knowledge/patterns/file.md)

Documentation structure to create and maintain:
.claude/knowledge/
|-- session.md           # Current session's raw captures (you must clear this)
|-- INSTRUCTIONS.md     # Knowledge remembering instructions (referenced by CLAUDE.md)
|-- architecture/        # System design, component relationships
|-- patterns/           # Coding patterns, conventions
|-- dependencies/       # External services, libraries
|-- workflows/          # How to do things in this project
|-- gotchas/           # Surprises, non-obvious behaviors
|-- KNOWLEDGE_MAP.md        # User-facing index with markdown links
|-- KNOWLEDGE_MAP_CLAUDE.md # Claude-facing index with RELATIVE @ references

After completing all updates, inform the user that documentation has been updated.`
  ],

  distill_generate: [
    `Launch parallel inquisitor agents to research each knowledge entry.

Your task:
1. Read ALL *.md files in .claude/knowledge/ EXCEPT session.md
2. For EACH substantive knowledge entry found, launch an inquisitor agent
3. Each inquisitor researches ONE specific entry to verify it against the codebase
4. Collect all their research findings

The inquisitor agents will return structured reports with:
- What I Found (current state)
- Changes Detected (recent modifications)
- Related Knowledge (similar entries)
- Observations (discrepancies/issues)

Launch as many inquisitor agents as needed to thoroughly verify the knowledge base.
Aim for comprehensive coverage of all knowledge entries.`,

    `Process all inquisitor findings and create distill-report.md.

Based on the research from all inquisitor agents:

1. **ANALYZE ALL FINDINGS**:
   - Synthesize research from all inquisitors
   - Identify exact duplicates, near-duplicates, conflicts, outdated info, junk
   - Categorize: AUTO_FIX (clear issues) vs REQUIRES_REVIEW (ambiguous)

2. **AUTO-FIX CLEAR ISSUES**:
   - Remove exact duplicate sections
   - Delete junk/useless information
   - Fix broken references
   - Consolidate redundant information
   - Track all changes made

3. **GENERATE ./distill-report.md** with:
   ## Automated Changes
   [List all auto-fixes made with file names and descriptions]

   ## Requires Review
   [List conflicts needing human guidance]

   For each review item:
   - **Issue**: Clear description
   - **Location**: File path(s)
   - **Current State**: What exists now
   - **Options**: Suggested resolutions

   <!-- USER INPUT START -->
   [Your decisions here]
   <!-- USER INPUT END -->

4. Save to ./distill-report.md (repository root)
5. DO NOT commit changes`,

    `think hard

Review your synthesis and distill-report.md:

1. **EDGE CASE REVIEW**:
   - Check for circular duplicates (A->B->C->A)
   - Identify partial overlaps with unique info
   - Consider context-dependent accuracy
   - Look for recently deleted code references
   - Flag ambiguous references

2. **VALIDATION**:
   - Ensure no valuable knowledge is accidentally deleted
   - Verify auto-fixes are truly safe
   - Double-check categorization (auto-fix vs review)
   - Confirm all inquisitor findings were addressed

3. **REFINEMENT**:
   - Adjust recommendations if needed
   - Add any missed issues
   - Improve clarity of review items
   - Update distill-report.md with any changes

Take your time to think through edge cases and ensure the report is thorough and accurate.`
  ],

  distill_refine: [
    `Execute this MANDATORY refinement process:

1. **READ DISTILL REPORT FROM ./distill-report.md**:
   - Read ./distill-report.md (repository root) completely
   - Check if there are any <!-- USER INPUT START --> ... <!-- USER INPUT END --> blocks
   - If present, parse the user's decisions/instructions from between these tags

2. **APPLY USER DECISIONS TO KNOWLEDGE FILES (if any)**:
   - If user input blocks exist, apply the requested changes to the appropriate files
   - Knowledge files are in .claude/knowledge/ (various topic .md files)
   - Special files: KNOWLEDGE_MAP.md (user index) and KNOWLEDGE_MAP_CLAUDE.md (Claude index)
   - DO NOT DELETE either KNOWLEDGE_MAP, we want both the markdown-link and claude-reference versions
   - Make precise edits based on user instructions
   - If changes affect the knowledge maps, update both consistently

3. **DELETE THE REPORT**:
   - After successfully applying any refinements (or if only auto-fixes), delete ./distill-report.md
   - This indicates the refinement session is complete

4. **VERIFICATION**:
   - If user decisions were applied, ensure all changes were applied correctly
   - Verify consistency between KNOWLEDGE_MAP.md and KNOWLEDGE_MAP_CLAUDE.md if modified
   - Report completion status and list of files modified (if any)

IMPORTANT: The report is at ./distill-report.md (repository root). If there are no user input blocks, just delete the report to mark completion (changes were already made during distill).`
  ]
};
