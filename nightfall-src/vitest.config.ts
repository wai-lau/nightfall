import { defineConfig } from "vitest/config";

// AUDIO_BASE_URL is normally injected by webpack's DefinePlugin; provide it here
// so modules that pull in audio sources can be imported under test.
export default defineConfig({
  define: {
    AUDIO_BASE_URL: '"/audio"',
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
