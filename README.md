# aboutme-wd

A multi-page personal website for Abner Flores.

## File structure

- index.html — home page
- media.html — media page
- future.html — future page
- web-development.html — selected topic page
- digital-creativity.html — selected topic page
- admin.html — browser-based admin dashboard
- styles.css — shared website styles
- script.js — shared client-side behavior
- admin.js — admin dashboard behavior
- server.js — dependency-free Node static server
- assets/ — general site assets
- images/ — image files
- videos/ — video files

## Run locally

Run node server.js, then open http://localhost:3000.

The admin dashboard currently saves edits to localStorage in the browser. The server includes a small health endpoint at /api/health and is ready to be extended with persistent storage.

## Open in Replit

[Import this GitHub repository into Replit](https://replit.com/github.com/AbnerFlores27/aboutme-wd)

The current Replit project files are in [`replit-project/`](./replit-project/). This link imports the GitHub repository into Replit; it does not open the original workspace or a published live website.
