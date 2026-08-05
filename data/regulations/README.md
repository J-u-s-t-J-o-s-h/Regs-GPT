# Regulation corpus

PDFs in this folder are the source material for RegsGPT's retrieval index.

The PDFs themselves are **not committed** — they are large binaries and are
covered by `data/regulations/*.pdf` in `.gitignore`. Download them locally, then
build the index:

```bash
npm run ingest
```

Re-running is safe: each document's chunks are replaced, not duplicated.

## Where to get the files

Official source: **Army Publishing Directorate** — <https://armypubs.army.mil>

Direct PDF links are **not stable**. Each revision gets a new `ARN#####`
filename, so previously working URLs start returning *"The resource you are
looking for has been removed, had its name changed, or is temporarily
unavailable."* This has been verified — do not hardcode these links.

To fetch a current copy:

1. Open the index search page:
   <https://armypubs.army.mil/ProductMaps/PubForm/ActiveInactiveRescSearch.aspx>
2. Search for the publication number (e.g. `AR 670-1`).
3. Open its Details page and download the linked PDF.
4. Save it here using the publication number as the filename — the ingester uses
   the filename as `doc_id`, and that value appears in citations.

## Starter set

| Filename | Publication | Title |
| --- | --- | --- |
| `AR 670-1.pdf` | AR 670-1 | Wear and Appearance of Army Uniforms and Insignia |
| `AR 600-20.pdf` | AR 600-20 | Army Command Policy |
| `AR 600-8-10.pdf` | AR 600-8-10 | Leaves and Passes |

## Retrieval log

Record what you actually downloaded, since these documents are revised:

| Filename | Source URL | Retrieved | Revision date |
| --- | --- | --- | --- |
| `AR 670-1.pdf` | https://armypubs.army.mil/epubs/DR_pubs/DR_a/ARN30302-AR_670-1-001-WEB-3.pdf | 2026-08-05 | 01/26/2021 |
| `AR 600-20.pdf` | https://armypubs.army.mil/epubs/DR_pubs/DR_a/ARN46266-AR_600-20-000-WEB-1.pdf | 2026-08-05 | 04/15/2026 |
