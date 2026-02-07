import { assert } from "/deps.ts";
import { createProvider } from "/internal/app/moviematch/providers/plex.ts";

const TEST_PLEX_URL = Deno.env.get("TEST_PLEX_URL");
const TEST_PLEX_TOKEN = Deno.env.get("TEST_PLEX_TOKEN");

const hasTestCredentials = TEST_PLEX_URL && TEST_PLEX_TOKEN;

if (hasTestCredentials) {
  Deno.test("providers -> plex -> getFilters", async () => {
    const provider = createProvider("0", {
      url: TEST_PLEX_URL!,
      token: TEST_PLEX_TOKEN!,
      libraryTypeFilter: ["movie"],
    });

    const filters = await provider.getFilters();

    assert(!!filters);
  });
} else {
  console.warn(
    "Skipping Plex provider tests: TEST_PLEX_URL and TEST_PLEX_TOKEN environment variables are not set",
  );
}
