import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const expoRoot = process.cwd();
const sourceDistDir = path.resolve(expoRoot, "../neon-hoops-app/dist");
const sourceAssetsDir = path.join(sourceDistDir, "assets");
const docsDir = path.resolve(expoRoot, "docs");
const docsAssetsDir = path.join(docsDir, "assets");

async function syncWebPages() {
  const indexPath = path.join(sourceDistDir, "index.html");
  const rawIndex = await readFile(indexPath, "utf8");

  const pagesIndex = rawIndex
    .replace(/src="\/assets\//g, 'src="./assets/')
    .replace(/href="\/assets\//g, 'href="./assets/');

  await mkdir(docsDir, { recursive: true });
  await rm(docsAssetsDir, { recursive: true, force: true });
  await cp(sourceAssetsDir, docsAssetsDir, { recursive: true });
  await writeFile(path.join(docsDir, "index.html"), pagesIndex, "utf8");
  await writeFile(path.join(docsDir, "404.html"), pagesIndex, "utf8");

  console.log("Synced GitHub Pages files:");
  console.log(`- ${path.join(docsDir, "index.html")}`);
  console.log(`- ${path.join(docsDir, "404.html")}`);
  console.log(`- ${docsAssetsDir}`);
}

syncWebPages().catch((error) => {
  console.error("Failed to sync web pages:", error);
  process.exit(1);
});
