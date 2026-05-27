import { computed } from 'vue';
import { i as useState } from './server.mjs';

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
function useDirection() {
  const selectedWikiInstanceId = useState(
    "selectedWikiInstanceId",
    () => WIKI_INSTANCES[0]?.id ?? "enwiki"
  );
  const direction = computed(() => {
    const selectedWikiInstance = getWikiInstanceById(selectedWikiInstanceId.value);
    return selectedWikiInstance?.dir ?? "ltr";
  });
  return {
    selectedWikiInstanceId,
    direction
  };
}

export { WIKI_INSTANCES as W, getWikiInstanceById as g, useDirection as u };
//# sourceMappingURL=useDirection-By8KVeOx.mjs.map
