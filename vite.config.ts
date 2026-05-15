import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// In CI, GITHUB_REPOSITORY is "owner/repo" — extract repo name for gh-pages base.
// Locally, base is "/" so absolute imports work in dev.
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = process.env.CI && repoName ? `/${repoName}/` : "/";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base,
});
