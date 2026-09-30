# bits-ghost-poetry

Support for poetry markup in Markdown under Ghost.

First deployed on [coreyjmahler.com](https://coreyjmahler.com/) (Ghost 6). It does not patch Ghost core and it does not target newsletters.

License: [MIT](LICENSE).

## Status

v1.1. Usable. Authors write a fenced `poem` block; Ghost stores it as a code card; the published page rewrites that card into typeset verse.

The editor may still look like a code card. Email rendering is out of scope; readers who care use the canonical URL.

## Install

No Ghost plugin is involved. You paste two files into Code Injection.

1. Open Ghost Admin → **Settings** → **Code injection**.
2. In **Site header**, add a `<style>` block whose contents are [`inject/poetry.css`](inject/poetry.css).
3. In **Site footer**, add a `<script>` block whose contents are [`inject/poetry.js`](inject/poetry.js).
4. Save.

The header should look like this:

```html
<style>
/* paste inject/poetry.css here */
</style>
```

The footer should look like this:

```html
<script>
/* paste inject/poetry.js here */
</script>
```

Leave any existing injection in place. Append these blocks; do not replace unrelated CSS or analytics.

If you previously pasted an earlier draft of these files, replace that draft with the current files. v1 flattened two-space indents; v1.1 does not.

### Authoring

In the Ghost editor, create a code card whose language is `poem`, or type:

````markdown
```poem
I said, I will guard my ways,
  so as not to sin with my tongue;

I set a watch for my mouth
  when the sinner stood opposite me.
```
````

A newline is a verse line. A blank line is a stanza break. Leading spaces are indent (a tab counts as four spaces). Ordinary prose elsewhere in the post is unchanged.

Publish or preview on the **website**, not in the editor canvas and not in a newsletter send.

### After install

- A ` ```javascript ` (or any non-`poem`) code card must still look like code.
- Hard-refresh once after saving Code Injection.
- If the poem block sits hard left instead of centering on its longest line, the theme is winning the margin cascade. See [`PLAN.md`](PLAN.md) section 9.

## Documents

| File | Role |
| --- | --- |
| [`PLAN.md`](PLAN.md) | Goal, non-goals, authoring contract, transform rules, deployment, acceptance |
| [`inject/poetry.css`](inject/poetry.css) | Published-page styles |
| [`inject/poetry.js`](inject/poetry.js) | Published-page rewriter |
| [`LICENSE`](LICENSE) | MIT |

Vendor: Bristlecone IT Services. Repository slug uses the lowercase `bits-` helper bucket.
