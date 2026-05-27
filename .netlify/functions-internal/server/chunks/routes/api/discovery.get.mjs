import { e as defineEventHandler, l as getQuery, c as createError } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'better-sqlite3';

const WIKI_INSTANCES = [
  {
    id: "enwiki",
    displayName: "English Wikipedia",
    baseUrl: "https://en.wikipedia.org",
    dir: "ltr",
    language: "en"
  },
  {
    id: "eswiki",
    displayName: "Spanish Wikipedia",
    baseUrl: "https://es.wikipedia.org",
    dir: "ltr",
    language: "es"
  },
  {
    id: "hewiki",
    displayName: "Hebrew Wikipedia",
    baseUrl: "https://he.wikipedia.org",
    dir: "rtl",
    language: "he"
  },
  {
    id: "fawiki",
    displayName: "Farsi Wikipedia",
    baseUrl: "https://fa.wikipedia.org",
    dir: "rtl",
    language: "fa"
  },
  {
    id: "commonswiki",
    displayName: "Wikimedia Commons",
    baseUrl: "https://commons.wikimedia.org",
    dir: "ltr",
    language: "en"
  },
  {
    id: "wikidata",
    displayName: "Wikidata",
    baseUrl: "https://www.wikidata.org",
    dir: "ltr",
    language: "en"
  }
];
function getWikiInstanceById(wikiInstanceId) {
  return WIKI_INSTANCES.find((wikiInstance) => wikiInstance.id === wikiInstanceId);
}

const DISCOVERY_USER_AGENT = "frontdoor-dev-portal/0.1 (https://www.mediawiki.org/wiki/Front_Door_Developer_Portal)";
const discovery_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const wikiInstanceId = typeof query.wikiInstanceId === "string" ? query.wikiInstanceId : "";
  const selectedWikiInstance = getWikiInstanceById(wikiInstanceId);
  if (!selectedWikiInstance) {
    throw createError({
      statusCode: 400,
      statusMessage: "Unknown wiki instance id."
    });
  }
  const discoveryUrl = `${selectedWikiInstance.baseUrl}/w/rest.php/specs/v0/discovery`;
  try {
    return await $fetch(discoveryUrl, {
      headers: {
        "user-agent": DISCOVERY_USER_AGENT
      }
    });
  } catch (error) {
    const statusCode = typeof error === "object" && error !== null && "statusCode" in error && typeof error.statusCode === "number" ? error.statusCode : 502;
    throw createError({
      statusCode,
      statusMessage: "Failed to fetch discovery from upstream instance."
    });
  }
});

export { discovery_get as default };
//# sourceMappingURL=discovery.get.mjs.map
