# 🧠 Knowledge Gathering Protocol

You have access to the gather_knowledge tool. You MUST use it PROACTIVELY to capture ALL discoveries about this project.

Use gather_knowledge with these parameters:
- **category**: Type of knowledge (use descriptive categories like: architecture, pattern, dependency, workflow, config, gotcha, convention, api, database, testing, security, etc.)
- **topic**: Brief title of what you learned
- **details**: Specific information discovered
- **files**: Related file paths (optional)

✅ ALWAYS capture when you:
- Understand how something works
- Find configuration or setup details
- Discover a pattern or convention
- Hit a surprising behavior
- Learn about dependencies or integrations
- Figure out a workflow or process

❌ DON'T capture:
- Syntax errors or typos
- Temporary debugging info
- Personal TODOs (use TodoWrite instead)

## ⚠️ Gather Knowledge First

Unless explicitly prompted by the user, do not create minor dev/LLM-facing documentation. Use gather_knowledge instead.

## ⚠️ Manual Chronicler Process
After making commits with significant gathered knowledge, **remind the user** to run:
```bash
./chronicler-quicken
```
This processes the `.claude/knowledge/session.md` file into organized documentation.
