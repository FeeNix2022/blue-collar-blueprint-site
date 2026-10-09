# Blue Collar Blueprint

One-page, mobile-first site for Blue Collar Blueprint, a division of Phoenix Heart AI. Revenue Leak Calculator and audit request form for HVAC contractors.

Plain HTML, CSS, and JS. No build step, no dependencies. Fonts load from Google Fonts (Archivo, IBM Plex Sans, IBM Plex Mono).

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page markup and copy |
| `styles.css` | Styles. Palette tokens (`--ink`, `--ember`, `--bone`) are at the top |
| `script.js` | Calculator logic and form submit. `FORM_ENDPOINT` is the first line |

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# http://localhost:8000
```

## Connect the form

The form does nothing until `FORM_ENDPOINT` is set. With it empty, the page shows "not connected" and sends nothing, so it will not silently drop leads.

1. Create an endpoint with a form service (Formspree, Basin, Getform) or your own handler.
2. Edit the constant at the top of `script.js`:

   ```js
   const FORM_ENDPOINT = "https://formspree.io/f/your-id";
   ```

3. Commit and push. Test with a real submission.

The form sends JSON by `POST` with `Accept: application/json`. Fields: `name`, `business`, `phone`, `email`, plus the calculator values the visitor had on screen (`calc_missed_calls_per_week`, `calc_close_rate_pct`, `calc_avg_job_value`, `calc_est_monthly_loss`, `calc_est_yearly_loss`). A hidden `website` honeypot field is dropped before sending.

If your endpoint needs a different format (form-encoded, a different field layout), change the `fetch` call in `script.js`.

## Deploy to GitHub Pages

1. Push this repo to GitHub with the site files at the repo root (`index.html` next to `styles.css` and `script.js`).
2. In the repo, go to **Settings > Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Pick your branch (usually `main`) and folder `/ (root)`. Save.
5. Wait about a minute. The site is live at `https://<user-or-org>.github.io/<repo-name>/`.

Asset paths are relative, so the site works under the `/<repo-name>/` subpath without changes.

### Custom domain (optional)

1. In **Settings > Pages > Custom domain**, enter your domain and save.
2. At your DNS provider, add the records GitHub lists in its [custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).
3. Enable **Enforce HTTPS** once the certificate is issued.

## Calculator formula

```
monthly = missed calls/week x (52 / 12) x close rate x average job value
yearly  = monthly x 12
```

This is a ceiling: it assumes every missed call would have closed at the contractor's normal rate. The page says so.

## Before launch

- Set `FORM_ENDPOINT`.
- Add a privacy policy link if your form service or jurisdiction requires one.
- The page makes no performance claims or testimonials. Add real case data to the page only once you have it.
