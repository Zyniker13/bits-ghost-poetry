# bits-ghost-poetry

Support for poetry markup in Markdown under Ghost.

This repository is a helper for [coreyjmahler.com](https://coreyjmahler.com/) (Ghost 6). It does not patch Ghost core and it does not target newsletters.

## Status

Planning. The implementation plan is in [`PLAN.md`](PLAN.md).

## Intent

Authors write a fenced block tagged `poem` in the Ghost editor. Ghost stores that fence as a code card. On the published page, a small front-end script rewrites `language-poem` code blocks into semantic verse markup, and site CSS typesets the result.

The editor may still look like a code card. That is accepted. Email rendering is out of scope; readers who care use the canonical URL.

## Documents

| File | Role |
| --- | --- |
| [`PLAN.md`](PLAN.md) | Goal, non-goals, authoring contract, transform rules, deployment, acceptance |
| [`inject/poetry.css`](inject/poetry.css) | Draft published-page styles |
| [`inject/poetry.js`](inject/poetry.js) | Draft published-page rewriter |

Vendor: Bristlecone IT Services. Repository slug uses the lowercase `bits-` helper bucket.
