# CAD Bench Website

This repository is the manually curated public results site.

`approved_runs.json` is an explicit hand-edited allowlist of provenance reports to
show on the site. Benchmark runners in `CAD-bench/cad-bench` should not clone,
edit, commit, or push this repository automatically.

After manually reviewing and editing `approved_runs.json`, render `index.html`
from a checkout of the benchmark repo:

```bash
uv run python scripts/render_site.py \
  --approved-runs-json /path/to/cad-bench.github.io/approved_runs.json \
  --output-html /path/to/cad-bench.github.io/index.html
```
