# CAD Bench Website

This repository hosts the CAD-bench research page, its manually curated results table, and an embedded reference-model viewer.

`approved_runs.json` is an explicit hand-edited allowlist of provenance reports to
show on the site. Benchmark runners in `CAD-bench/cad-bench` should not clone,
edit, commit, or push this repository automatically.

After manually reviewing and editing `approved_runs.json`, render `index.html`
from a checkout of the benchmark repo:

```bash
uv run python scripts/render_site.py \
  --approved-runs-json /path/to/cad-bench.github.io/approved_runs.json \
  --output-html /path/to/cad-bench.github.io/results/index.html
```

The homepage reads the payload from `results/index.html`, so updating the
standalone table also updates the main leaderboard. Keep the homepage at
`index.html`; do not overwrite it with the table renderer.

The interactive model viewer is embedded from the existing
https://cad-bench.pages.dev/ deployment. Its full-screen link remains available.

The page uses the Academic Project Page / Nerfies template, with attribution
and the template license linked in the footer. Tabulator is distributed under
the MIT license; see `assets/tabulator-LICENSE.txt`.
