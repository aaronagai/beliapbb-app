// GitHub Pages serves files, not routes: give /app/ its own copy of the SPA shell,
// and use the same shell as the 404 page so unknown paths still boot the app.
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("dist/app", { recursive: true });
copyFileSync("dist/index.html", "dist/app/index.html");
copyFileSync("dist/index.html", "dist/404.html");
