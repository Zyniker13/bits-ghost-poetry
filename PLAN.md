# Plan: Poetry Fences on a Ghost Site

Status: v1.1 — indent and centering corrected after the first live preview.
Site: [coreyjmahler.com](https://coreyjmahler.com/) (Ghost 6.9 as of 2026-09-30).
Deployment target: Ghost Code Injection, not a theme fork and not a core patch.

## 1. Goal

Stop spending editorial time fighting Ghost and Markdown for verse. On the **published web page**, a poem written as a fenced Markdown block must:

- keep verse line breaks without looking like a code sample;
- treat a blank line as a stanza break;
- preserve leading indentation **exactly as typed** (two spaces is a real indent);
- hang wrapped overflow under the verse line it belongs to;
- use the theme body face, not monospace;
- leave ordinary prose on the same site untouched.

Authoring in the Ghost editor as ` ```poem ` is the intended input. A published page that looks correct is sufficient. The editor preview may remain a code card.

## 2. Non-Goals

Do not do any of the following in this pass:

- Patch Ghost core or markdown-it.
- Add a native Koenig / Lexical Poem card.
- Make the editor preview look like typeset verse.
- Restyle Ghost newsletters or email. Readers who care click through to the canonical URL.
- Apply `white-space: pre` to every paragraph on the site.
- Build a WordPress plugin, a Ghost marketplace extension, or a public product page.
- Invent a customer-facing display name. The repository slug is enough until a later naming decision.

## 3. Why This Shape

Ghost is a Lexical editor. Typing ` ```poem ` and pressing Enter creates a **code card** whose language is `poem`. Ghost then emits a `<pre><code class="language-poem">` block (sometimes wrapped in `figure.kg-code-card` if the card has a caption).

There is no supported hook for a custom fence renderer on Ghost(Pro). A client-side rewrite of that already-stable markup is the smallest change that meets the goal and survives Ghost upgrades.

The Markdown card path produces the same `language-poem` class. One rewriter covers both the main-editor shortcut and a Markdown card that contains a ` ```poem ` fence.

## 4. Authoring Contract

Writers use this form:

````markdown
```poem
I said, I will guard my ways,
  so as not to sin with my tongue;

I set a watch for my mouth
  when the sinner stood opposite me.
```
````

Rules inside the fence:

| Source | Meaning |
| --- | --- |
| A non-empty line | One verse line |
| A blank line | Stanza break |
| Leading spaces | Indent. Each space is one indent unit. |
| Leading tab | Four indent units. |
| A line that is only an em-dash attribution after the last stanza | Optional attribution; rendered with class `attrib` |
| `*text*` / `**text**` / `[label](url)` | Optional, later. Not required for v1. |

Do not put HTML inside the fence in v1. Do not rely on trailing two-space Markdown breaks; the fence already preserves newlines.

Two-space (and six-space, eight-space) indents are first-class. v1 treated only four-space steps as indent and discarded the rest; that failed on Psalm 38 / the 30 Sep 2026 preview and is rejected.

Caption field on the Ghost code card, if used, becomes a figcaption **outside** the poem and is left alone. Attribution belongs in the fence, not in the code-card caption, unless a later pass decides otherwise.

## 5. Published HTML Ghost Already Emits

Expect one of these shapes:

```html
<pre><code class="language-poem">…</code></pre>
```

```html
<figure class="kg-card kg-code-card">
  <pre><code class="language-poem">…</code></pre>
  <figcaption>…</figcaption>
</figure>
```

Themes may also put `language-poem` on the `<pre>`. The rewriter must accept either node.

`textContent` of the `<code>` (or `<pre>` if there is no inner code) is the poem source. Do not use `innerHTML` as the source of lines; syntax highlighters may wrap tokens.

## 6. Transform

On `DOMContentLoaded`, and once more on a `MutationObserver` of `.gh-content` if the theme hydrates late:

1. Select `pre code.language-poem, pre.language-poem, code.language-poem` inside the post body (`.gh-content`, with fallbacks `.post-content` and `article`).
2. Skip nodes already processed (`data-bits-poem="1"` on the replacement).
3. Read plain text. Normalize `\r\n` to `\n`. Strip one leading and one trailing newline if Ghost added them.
4. Split on `\n`. Consecutive blank lines collapse to a single stanza break. Leading/trailing blank lines are dropped.
5. For each non-empty line, count leading spaces (tab = 4). Strip that prefix from the text node. Store the count as `--poem-indent` on the line span.
6. Build:

```html
<div class="poem" data-bits-poem="1">
  <p class="stanza">
    <span class="line" style="--poem-indent: 0ch">…</span>
    <span class="line" style="--poem-indent: 2ch">…</span>
  </p>
</div>
```

7. Replace the `<pre>` with that `<div>`. If the `<pre>` sits in `figure.kg-code-card` **and** the figure contains only the pre (no caption), replace the whole figure. If a caption exists, replace only the pre and leave the figure/caption.
8. Escape text when building spans. v1 is text-only inside lines.

Attribution heuristic (conservative): if the last non-empty line matches `/^\s*(?:—|--|---)\s+\S/` and the poem has at least one prior line, render it as `<span class="attrib">` after the last stanza instead of as a verse line.

## 7. CSS Contract

All rules are scoped to `.poem`. Never set `white-space: pre` on bare `p`.

Required behavior:

- `.poem` is `width: fit-content; max-width: 100%; margin-inline: auto; justify-self: center; text-align: left` so the block is optically centered on its longest line while lines stay left-aligned. Ghost canvas rules zero child margins; `justify-self: center` is required on `.gh-canvas` children.
- Each `.line` is `display: block` with hanging indent (`1.25em` gutter) plus `padding-left: calc(1.25em + var(--poem-indent))` so a wrap is not mistaken for a new verse line and typed spaces survive as indent.
- Stanzas have space between them, not after the last stanza.
- Font inherits the post body. No monospace. No forced italic on the whole poem.
- Narrow viewports: `.poem { width: 100%; }` so long lines wrap instead of overflowing.

Draft rules live in `inject/poetry.css`.

## 8. JavaScript Contract

- No dependencies.
- IIFE. No global exports required.
- Do not query `document` beyond the post content root.
- Do not touch admin (`/ghost/`).
- Idempotent. Safe if Code Injection runs twice.
- Fail closed: if parsing throws, leave the original `<pre>` in place.

Draft rewriter lives in `inject/poetry.js`.

## 9. Deployment on the Site

1. Ghost Admin → Settings → Code injection → **Site header**: wrap `inject/poetry.css` in `<style>`.
2. Same screen → **Site footer**: wrap `inject/poetry.js` in `<script>`.
3. Replace any earlier v1 paste with v1.1. The old four-space step logic will keep flattening two-space verse if left in place.
4. Publish a draft post that contains only a ` ```poem ` card and one prose paragraph. Confirm the paragraph is unchanged and the card is rewritten.
5. Confirm a real ` ```javascript ` (or other) code card is **not** rewritten.
6. Confirm a Markdown card containing a ` ```poem ` fence is rewritten the same way.

If a theme stylesheet still wins the cascade on centering, add `!important` only on `margin-left`, `margin-right`, and `justify-self`.

Code Injection is the right vehicle: it survives theme updates. A later optional step is to copy the same two files into a child theme. That is not required for v1.

## 10. Acceptance

A draft post on coreyjmahler.com passes when all of the following are true:

1. A ` ```poem ` card with two stanzas renders as two stanza groups, not as a monospace slab.
2. A line indented with **two** spaces is visibly stepped in from the left margin of the poem. Four, six, and eight spaces are visibly deeper in proportion.
3. A verse line long enough to wrap hangs under itself rather than looking like a new line.
4. The poem block is centered as a unit; individual lines are not centered.
5. Adjacent prose paragraphs keep normal Markdown/Ghost spacing and wrapping.
6. A ` ```js ` code card on the same page is untouched.
7. Reloading the published page does not duplicate or nest `.poem` wrappers.
8. View-source still contains the original code card HTML (the rewrite is client-side). That is acceptable.

Reference fixture: the 30 Sep 2026 untitled preview of Psalm 38 (LXX / Coverdale-shaped), which uses 0 / 2 / 4 / 6 / 8 space indents in the last stanza.

Newsletter appearance is not an acceptance item.

## 11. Work Sequence

1. Confirm live markup for a ` ```poem ` code card on a private draft (Inspect). Adjust selectors in `inject/poetry.js` if the theme diverges from `.language-poem`.
2. Paste CSS into Site header. Confirm it does nothing until a `.poem` exists.
3. Paste JS into Site footer. Confirm the draft poem transforms.
4. Tune hanging-indent and stanza spacing against the live body font.
5. Add one real poem to an essay and read it on a phone-width viewport.
6. Freeze v1.1. Further syntax (`*emphasis*` inside lines, caesura marks, hymn modifiers) waits until a poem needs it.

v1.0 shipped and was checked against the Psalm 38 preview. Failures: two-space indents dropped; leftover spaces left in the text node; Ghost canvas zeroed auto margins so the block did not center. v1.1 addresses those.

## 12. Later, Explicitly Deferred

- Inline Markdown inside lines.
- `class="poem hymn"` modifiers.
- Server-side rewrite so no-JS readers and scrapers see verse HTML.
- A WordPress sibling that compiles the same fence.
- A first-class Ghost card if an official card-plugin API becomes stable.

None of those are implied by committing this plan.
