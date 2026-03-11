# thalespomari.dev

Personal portfolio and blog. Built with Astro, hosted on GitHub Pages, served at [thalespomari.dev](https://thalespomari.dev).

## Stack

- **Framework**: Astro (static site generation)
- **Styling**: Custom CSS — neo-brutalist design system with dark mode
- **Hosting**: GitHub Pages
- **Deploy**: GitHub Actions on push to `main`
- **Domain**: thalespomari.dev via Hostinger DNS

## Project Structure

```
src/
  pages/
    index.astro       # Home
    about.astro       # About & bio
    projects.astro    # Projects
    blog/
      index.astro     # Blog listing
      [id].astro      # Individual post
  content/
    blog/             # Markdown posts
  layouts/
    BaseLayout.astro  # Shared layout (nav, footer, theme toggle)
  styles/
    global.css        # Design system & CSS variables
public/
  email-signature.html
.github/
  workflows/
    deploy.yml        # CI/CD pipeline
```
