# italki Design Principles

*Last updated: 21 July 2026*

## Purpose

These principles guide how we design italki product experiences across web, app, classroom, learning tools, AI, marketplace, and internal systems. They are meant to help teams make product decisions, critique design work, and resolve tradeoffs consistently.

italki's design should help curious learners and teachers unlock the world through language. We do that by making language learning human, real, trusted, connected, friendly, and open - powered by technology, but centered on people.

## Rule Priority

An approved Figma reference or existing product page governs its named page instance. Otherwise, resolve a rule by its owner: `DESIGN.md` owns product principles and direction; `COMPONENTS.md` owns Foundations and reusable UI contracts; `PATTERNS.md` owns product-object composition; `EXECUTION.md` owns page application, responsive behavior, and validation. No document overrides another document outside its owned concern.

## Mandatory Design System Compliance

The italki design system is a required implementation system, not optional visual inspiration. Every new or changed italki product surface, prototype, specification, or production implementation **must** use the Foundations, components, patterns, assets, and page rules defined in this documentation set. This requirement applies equally to human contributors and AI agents.

An implementation is not compliant merely because it resembles italki or reuses a few colors, radii, or icons. It must preserve the documented component contract, page composition, hierarchy, state behavior, accessibility behavior, and responsive behavior for the task being implemented.

### Non-Negotiable Rules

- AI agents must read and apply the relevant sections of `COMPONENTS.md`, `PATTERNS.md`, and `EXECUTION.md` before designing or coding an italki surface. They must identify the page family and its mandatory components before composing the page.
- When an approved component, pattern, asset, token, or page recipe exists, it **must be used as defined**. An AI agent must not replace it with a custom approximation, a generic framework component, an ad hoc visual treatment, or an unrelated icon set.
- All colors, typography, spacing, radius, elevation, icon assets, states, and responsive behavior must resolve from the design-system definitions that own them. Do not introduce arbitrary values, custom gradients, substitute fonts, decorative effects, or new component anatomy where an existing definition applies.
- A page must use the documented shell and navigation pattern for its product context. It must not recreate legacy navigation, page framing, or interaction models when the system defines a replacement.
- A reusable component must retain its documented anatomy, reading order, action hierarchy, content limits, state behavior, and accessibility contract. Reusing a component name while changing those rules is non-compliant.
- The local italki asset library is the source of truth for functional icons, flags, and approved brand marks. Do not draw substitutes, introduce external icon libraries, or use temporary external asset URLs when a local system asset exists.
- Search, filtering, sorting, booking, saved state, and other product interactions must follow the state and continuation rules in `EXECUTION.md`; a visual-only control or a state change that does not update its documented dependent content is not a valid implementation.

### Deviation Protocol

AI agents may not silently invent, omit, simplify, or override a design-system definition. If a required need is not covered by the system, or if a supplied Figma reference conflicts with it, the agent must:

1. identify the exact missing or conflicting definition and cite its owning document;
2. preserve all applicable existing system rules;
3. propose the smallest compatible extension; and
4. obtain explicit user or design-owner approval before implementing the deviation.

An instruction to make something "look like italki", "use italki style", or "improve the visual design" does not authorize a deviation from this system. A request to use the design system means strict compliance by default.

### Required Implementation Evidence

Before declaring an italki implementation complete, an AI agent must be able to show that:

- the selected page family and its mandatory components were used;
- every visible UI region maps to a documented component, pattern, or explicitly approved extension;
- Foundation values and local assets were used rather than invented substitutes;
- desktop and mobile follow the documented responsive structure; and
- interactive, empty, loading, error, and disabled states have been implemented or deliberately scoped with an approved rationale.

If this evidence cannot be established, the work must be described as an incomplete draft rather than a design-system-compliant implementation.

## How To Use These Principles

Use these principles when:

- defining product strategy or a PRD
- reviewing Figma designs, prototypes, and shipped experiences
- deciding what to remove, simplify, prioritize, or explain
- evaluating AI, gamification, personalization, and marketplace changes
- aligning product, brand, UX, content, engineering, and support

A good design decision should make at least one principle stronger without seriously weakening another. If a feature is clever but makes learning, teaching, booking, trust, or human connection harder, it is not an italki-quality experience.

## Documentation Map

This file is the product and design-direction source of truth. It defines why an experience should exist, which tradeoffs are acceptable, and the visual and behavioral character it must preserve.

- `docs/COMPONENTS.md` defines Foundations, Content Style, and reusable UI component contracts.
- `docs/PATTERNS.md` defines italki product compositions and object relationships using those components.
- `docs/EXECUTION.md` defines page-level responsive behavior, interaction, state, accessibility behavior, and implementation constraints.
- `index.html` is the visual browser for reviewed design-principle content, Foundations, components, and documented product patterns. It keeps components and patterns in separate navigation groups and is not an additional prose specification.

## Product Design Direction

italki is a warm, trustworthy, lightweight, and easy-to-scan language-learning marketplace. A product surface should foreground the human relationship and the evidence needed for a learner or teacher to make a confident next decision: identity, teaching fit, price, trust signals, availability, lesson context, and the next meaningful action.

- Make the current learner or teacher job obvious before showing optional promotion, AI, gamification, or campaign content.
- Establish hierarchy through information order, readable width, spacing, and density before using strong color, oversized type, decorative artwork, or repeated cards.
- Keep core paths stable: find a teacher, compare, book, attend, message, manage lessons and packages, and continue learning.
- Let human teachers, learners, conversations, and real-world language use remain more visible than the technology supporting them.
- Treat Mira, campaigns, and other richer surfaces as intentional exceptions with one focal purpose. They do not redefine the surrounding task hierarchy or visual language.
- Respect global usage: localization, text expansion, accessible interaction, varied device capability, and recovery from imperfect network or permissions are product-quality requirements, not edge cases.

---

## The Principles

### 1. Human Connection Comes First

Language is learned through people, culture, and shared experience. italki should make it easier for learners and teachers to find, trust, meet, speak with, and continue with each other.

Design should foreground the human relationship: the teacher, the learner, the conversation, the lesson, the feedback, the progress, and the cultural context. Technology can support the connection, but it should not become the center of attention.

**Design for:**

- clear paths to find, compare, contact, book, and rebook teachers
- teacher profiles that reveal real teaching style, expertise, personality, availability, lesson types, and fit
- classroom experiences where video, voice, names, permissions, network state, and lesson context are immediately understandable
- social proof, reviews, credentials, and community signals that help people choose with confidence
- communication patterns that feel respectful, warm, and personal

**Avoid:**

- AI or gamified features that compete with teachers for attention
- hiding messages, lessons, teacher profiles, packages, or favorite teachers behind unnecessary navigation
- abstract learning mechanics that make the experience feel less human or less real
- marketplace changes that reduce teacher visibility without a clear user benefit

**Ask in critique:**

- Does this help a learner connect with the right human teacher faster?
- Does this help a teacher be understood, trusted, and booked by the right learners?
- Is the human relationship more visible than the system around it?

### 2. Make Learning Feel Real

italki is not just a study tool. It is a way to speak, belong, travel, work, study, teach, and participate in the world. Design should connect language practice to real expression, real contexts, and real progress.

Every interaction should respect that language learning is emotional: people feel nervous, proud, embarrassed, curious, stuck, motivated, and transformed. The product should make practice feel safe and useful, not performative or punitive.

**Design for:**

- conversation, expression, and cultural nuance over isolated completion loops
- practice activities that encourage trying, retries, exploration, and learning from mistakes
- visible progress that feels meaningful rather than childish or stressful
- lesson preparation, notes, vocabulary, summaries, and homework that help the next real conversation
- learning paths that adapt to goals such as travel, belonging, career, exams, confidence, or personal growth

**Avoid:**

- correctness-first flows that punish experimentation
- artificial streaks, pets, rewards, or pressure that distract from real learning
- empty celebration that does not connect to skill, confidence, or use in life
- over-scripted experiences that make communication feel fake

**Ask in critique:**

- Does this help someone speak, understand, or participate in real life?
- Does it make mistakes safer and progress clearer?
- Would a serious adult learner feel respected by this experience?

### 3. Earn Trust Through Clarity And Transparency

Trust is the core currency of a language-learning marketplace. Learners trust italki with their time, money, goals, confidence, and sometimes anxiety. Teachers trust italki with their income, reputation, schedule, and professional identity.

Design must be clear about what is happening, why it is happening, what the user can control, and what the consequences are. This is especially important for payments, packages, booking, cancellation, teacher discovery, AI, recording, ranking, permissions, privacy, and data.

**Design for:**

- clear labels, legible hierarchy, precise controls, and predictable navigation
- transparent marketplace signals: price, availability, teacher type, credentials, lesson length, cancellation policy, response expectations, and profile metrics
- plain-language explanations for AI, recording, permissions, personalization, and recommendations
- confirmation states, undo paths, recovery flows, and audit trails where trust is at stake
- localization quality that preserves meaning, tone, placeholders, and cultural nuance across languages

**Avoid:**

- hidden consequences, vague system behavior, or unexplained ranking/recommendation changes
- decorative hierarchy that makes basic actions harder to find
- AI suggestions that appear authoritative without confidence, source, or user control
- metrics that can be triggered accidentally or interpreted incorrectly

**Ask in critique:**

- Can users tell what will happen before they act?
- Can they understand why the system is recommending, ranking, recording, charging, or asking for permission?
- Would this still feel fair from both the learner and teacher side?

### 4. Keep The Core Path Simple

Learning a language is already hard. italki should not add avoidable cognitive load. The most important user paths - find a teacher, book a lesson, attend a lesson, message, manage packages, continue learning, and teach successfully - should be obvious, stable, and efficient.

Simplicity does not mean fewer ideas. It means the interface protects attention and makes the next useful action easy to recognize.

**Design for:**

- persistent, recognizable access to lessons, messages, search, favorite teachers, packages, calendar, and profile
- fewer clicks for repeated high-frequency actions
- content-first layouts where controls support the task instead of competing with it
- sensible defaults with progressive disclosure for advanced settings
- continuity across web and app so users do not relearn the product in every context

**Avoid:**

- making frequent actions depend on memory, hidden gestures, narrow sidebars, or buried menus
- putting novelty ahead of core tasks
- forcing users through promotional, AI, or gamified surfaces when they came to book, teach, or attend
- redesigning familiar flows without beta testing and migration support

**Ask in critique:**

- What is the user's primary job here, and is it visually obvious?
- Can an existing learner or teacher complete their usual task without relearning the platform?
- What can we remove, defer, or make optional?

### 5. Give People Agency

italki works because people have different goals, schedules, budgets, learning styles, teaching styles, cultures, devices, and comfort levels. Design should offer meaningful choice without making users assemble the whole experience from scratch.

Agency means people can choose, adapt, pause, retry, compare, hide, change, and recover. It also means teachers have enough control to represent their work accurately and sustainably.

**Design for:**

- flexible scheduling, lesson length, price, language, teacher type, specialization, and platform choices
- search and filters that match how learners actually decide
- teacher tools that support profile quality, lesson visibility, analytics, availability, and income stability
- user control over AI assistance, gamification, notifications, recording, layout, and learning modes
- optional branches for different goals while keeping recommended paths clear

**Avoid:**

- locking users into one rigid learning or booking model
- assuming one design works equally for first-time learners, long-time students, teachers, mobile users, and older users
- making optional features feel mandatory
- removing controls that users rely on without a better replacement

**Ask in critique:**

- What choices matter here, and are they available at the right moment?
- Can users opt out of non-essential assistance or personalization?
- Does this increase or reduce teacher agency?

### 6. Design Technology As A Helpful Companion

italki should feel like friendly technology with a human touch: modern, capable, and personal, but never technology for technology's sake. AI and automation should reduce effort, increase confidence, and create more opportunities for teachers and learners.

The right role for AI is to prepare, explain, summarize, translate, recommend, organize, and coach - while making the human lesson, teacher, and learner more successful.

**Design for:**

- AI that empowers teachers and learners rather than replacing them
- clear AI boundaries: what it can do, what it cannot do, what data it uses, and how users can correct it
- assistive moments around preparation, vocabulary, lesson summaries, grammar, translation, discovery, and support
- human review for brand-sensitive content, localization quality, marketplace-sensitive ranking, and high-stakes decisions
- calm, respectful AI entry points that appear when useful and recede when not

**Avoid:**

- AI pretending to be human
- AI front and center when the user's goal is to reach a teacher, lesson, message, or booking flow
- automation that makes teachers less visible or less understood
- novelty that adds friction, anxiety, or mistrust

**Ask in critique:**

- Who is being empowered by this technology?
- Is the AI reducing effort or adding another thing to manage?
- Could this harm trust, teacher income, learning quality, or user control?

### 7. Craft For A Global, Inclusive Community

italki is global by nature: many languages, cultures, devices, markets, ages, learning goals, and accessibility needs. The experience should feel open, welcoming, localized, and resilient across contexts.

Craft is not only visual polish. It is consistency, accessibility, performance, localization, motion, state design, empty states, error handling, documentation, and the small details that make the product feel reliable.

**Design for:**

- accessible color, type, focus states, keyboard support, screen-reader clarity, and touch targets
- localization-ready layouts and copy across supported languages, including text expansion and future RTL needs
- consistent design-system components, patterns, tokens, and interaction states
- platform familiarity on iOS, Android, and web while preserving italki's own brand character
- fast loading, graceful failure, clear empty states, and recovery from poor network or permission issues
- moments of delight that are warm, respectful, and connected to learning or belonging

**Avoid:**

- visual polish that hides information or reduces usability
- one-market assumptions about language, humor, culture, age, or technical confidence
- inconsistent components or custom patterns where familiar ones would be clearer
- motion, decoration, or personality that distracts from learning and teaching

**Ask in critique:**

- Does this work for different languages, ages, devices, and levels of technical confidence?
- Is the interface familiar enough to trust and distinctive enough to be italki?
- Are accessibility, localization, loading, errors, and edge cases designed - not left over?

---

## Decision Checklist

Before shipping a significant design change, answer:

1. What core learner or teacher job does this improve?
2. Does it make human connection more visible, easier, or more trusted?
3. Does it preserve easy access to lessons, messages, teacher search, booking, packages, favorites, and classroom?
4. Is the value clear without explanation from the team?
5. What user control, opt-out, or recovery path exists?
6. What could become confusing for existing users, older users, teachers, or mobile users?
7. How does this perform across localization, accessibility, low network quality, and different devices?
8. How will we beta test, measure, and respond before or after rollout?

## Practical Design Standards

### Navigation And Hierarchy

- Prioritize content and primary actions over decoration.
- Keep frequent actions stable and visible.
- Use hierarchy, spacing, and motion to clarify meaning, not to impress.
- Avoid hiding core tasks behind icons, drawers, or assistant surfaces without strong evidence.

### Marketplace And Teacher Discovery

- Help learners compare teachers by fit, not only by price or algorithmic score.
- Make profile depth easy to access: teaching style, lesson types, availability, intro video, qualifications, specialties, policies, and reviews.
- Treat teacher visibility and analytics as trust-sensitive product surfaces.
- Test ranking, discovery, and profile changes with both learner conversion and teacher health metrics.

### AI And Personalization

- AI should be optional or contextual unless it is essential to the user's task.
- Explain when AI is used and what user data or lesson data informs it.
- Preserve human review for sensitive content and marketplace-impacting decisions.
- Measure whether AI improves booking, learning, teaching, support, and retention - not just engagement with AI itself.

### Learning And Practice

- Encourage trying over perfection.
- Use feedback that is specific, kind, and actionable.
- Connect practice to real conversation and learner goals.
- Let learners repeat, skip, branch, or go deeper without penalty.

### Rollout And Feedback

- Beta test major navigation, AI, classroom, marketplace, and profile changes with students and teachers before broad rollout.
- Monitor support tickets, CSAT, NPS, app reviews, forum sentiment, teacher bookings, profile views, and lesson completion.
- Communicate major changes clearly and early.
- Treat confusion in core tasks as a release blocker, not a training problem.

---

## Source Notes

This draft synthesizes:

- italki Brand House: mission, vision, positioning, target consumer, and brand principles - Trusted, Real, Connected, Friendly, Open
- italki internal Experience Principles: natural humanized interaction, learning first, innovative effective learning, you are not alone, empower not replace, transparency by default, human first, less is more
- italki Brand Building and Brand Story notes: human connection, personalized learning, real communication, human-centered technology, learning science, cultural diversity, respectful humor, curiosity, texture, post-institutional learning, and the idea of italki as more of a backpack than a classroom
- italki Design Principles for Practice Activities: trying not perfection, curiosity, real-life expression, choice, retries, and low-stakes learning
- italki website and app-store positioning: 150+ languages, professional tutors, flexible schedule, pay as you go, teacher marketplace, community, learning tools, and personalized 1-on-1 lessons
- Classroom 2025/UX Revamp references: fixed video hierarchy, permissions, network state, recording, layout choice, settings, and lesson-supporting tools
- UX Revamp feedback: navigation breakdown, core-feature discoverability, intrusive AI/gamification, teacher visibility, profile depth, and the need for beta testing and clearer rollout
- Design System 2024 references: brand guidelines, principles, reusable components, patterns, interaction guidelines, accessibility, documentation, and assets
- i18n Localization Manager references: single source of truth, AI-assisted translation with human review, brand voice and glossary, audit trails, and Figma import
- Apple Human Interface Guidelines and 2026 design guidance: purpose, agency, responsibility, familiarity, flexibility, simplicity, craft, delight, plus the enduring importance of clarity, deference to content, and meaningful hierarchy/depth
