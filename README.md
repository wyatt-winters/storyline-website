# Storyline Photo Books

Marketing website for [Storyline](https://storylinebooks.net) — custom photo book design and production for families, professionals, and businesses.

**Tagline:** Just give me your pictures and I'll do the rest.

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero, book categories, Storyline difference |
| How It Works | `how-it-works.html` | Process, photo prep, pricing |
| Gallery | `gallery.html` | Sample covers and spreads |
| Testimonials | `testimonials.html` | Client stories |

## Local preview

Any static file server works. Examples:

```bash
# Python
python3 -m http.server 8080

# npx
npx serve .
```

Open [http://localhost:8080](http://localhost:8080).

## Deploy

### Netlify (recommended)

1. Push this repo to GitHub (see below).
2. In [Netlify](https://app.netlify.com), choose **Add new site → Import an existing project**.
3. Connect GitHub and select this repository.
4. Build settings (auto-detected from `netlify.toml`):
   - **Build command:** leave empty
   - **Publish directory:** `.` (root)
5. Deploy.

### Vercel

```bash
vercel
```

### GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/storyline-website.git
git push -u origin main
```

## Assets

- Images live in `images/`. See `images/README-IMAGES.txt` for naming conventions.
- Brochure PDF: `STORYLINE_Brochure.pdf`

## Contact

- **Helen Williams** — [helen@storylinebooks.net](mailto:helen@storylinebooks.net)
- **Phone** — [817-203-4755](tel:+18172034755)
