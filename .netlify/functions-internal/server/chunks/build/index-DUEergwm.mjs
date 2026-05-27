import { a as _export_sfc, d as useNuxtApp, _ as __nuxt_component_0, i as useState } from './server.mjs';
import { defineComponent, ref, computed, watch, shallowRef, mergeProps, unref, withCtx, isRef, createVNode, createTextVNode, toDisplayString, reactive, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { CdxField, CdxSelect, CdxButton, CdxMessage } from '@wikimedia/codex';
import { u as useDirection, W as WIKI_INSTANCES, g as getWikiInstanceById } from './useDirection-By8KVeOx.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'better-sqlite3';
import 'pinia';
import 'vue-router';
import 'perfect-debounce';
import '@vue/shared';
import 'banana-i18n';

function useExplorerDiagnostics() {
  const entries = useState("explorerDiagnosticsEntries", () => []);
  function logEvent(eventName, details = {}) {
    const entry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      event: eventName,
      details
    };
    entries.value.push(entry);
  }
  return {
    entries,
    logEvent
  };
}
const discoveryCacheByInstance = /* @__PURE__ */ new Map();
function useDiscovery(selectedWikiInstanceId) {
  const isLoading = ref(false);
  const hasError = ref(false);
  const errorMessage = ref("");
  const modules = ref([]);
  const { logEvent } = useExplorerDiagnostics();
  function normalizeSpecUrl(baseUrl, specUrl) {
    try {
      return new URL(specUrl, baseUrl).toString();
    } catch {
      return specUrl;
    }
  }
  function normalizeDiscoveryModules(discoveryModules, baseUrl) {
    const isUsableVersion = (version) => {
      return typeof version === "string" && version.trim() !== "" && version !== "undefined";
    };
    if (Array.isArray(discoveryModules)) {
      return discoveryModules.filter((rawModule) => typeof rawModule.name === "string" && typeof rawModule.specUrl === "string").map((rawModule) => ({
        name: rawModule.name,
        title: typeof rawModule.title === "string" ? rawModule.title : void 0,
        version: isUsableVersion(rawModule.version) ? rawModule.version : void 0,
        specUrl: normalizeSpecUrl(baseUrl, rawModule.specUrl)
      }));
    }
    if (discoveryModules && typeof discoveryModules === "object") {
      return Object.entries(discoveryModules).flatMap(([moduleKey, moduleValue]) => {
        const moduleName = typeof moduleValue.moduleId === "string" ? moduleValue.moduleId : moduleKey;
        const moduleVersion = isUsableVersion(moduleValue.info?.version) ? moduleValue.info.version : isUsableVersion(moduleValue.version) ? moduleValue.version : void 0;
        const moduleTitle = typeof moduleValue.info?.title === "string" ? moduleValue.info.title : void 0;
        const rawSpecUrl = typeof moduleValue.spec === "string" ? moduleValue.spec : typeof moduleValue.specUrl === "string" ? moduleValue.specUrl : "";
        if (!rawSpecUrl) {
          return [];
        }
        const normalizedModule = {
          name: moduleName,
          specUrl: normalizeSpecUrl(baseUrl, rawSpecUrl)
        };
        if (moduleTitle) {
          normalizedModule.title = moduleTitle;
        }
        if (moduleVersion) {
          normalizedModule.version = moduleVersion;
        }
        return [normalizedModule];
      });
    }
    return [];
  }
  async function fetchDiscoveryModules() {
    const selectedWikiInstance = getWikiInstanceById(selectedWikiInstanceId.value);
    if (!selectedWikiInstance) {
      modules.value = [];
      hasError.value = true;
      errorMessage.value = "Unknown wiki instance id.";
      logEvent("discovery.error", {
        reason: "unknown_instance",
        selectedWikiInstanceId: selectedWikiInstanceId.value
      });
      return;
    }
    if (discoveryCacheByInstance.has(selectedWikiInstance.id)) {
      modules.value = discoveryCacheByInstance.get(selectedWikiInstance.id) ?? [];
      hasError.value = false;
      errorMessage.value = "";
      logEvent("discovery.cache_hit", {
        selectedWikiInstanceId: selectedWikiInstance.id,
        moduleCount: modules.value.length
      });
      return;
    }
    isLoading.value = true;
    hasError.value = false;
    errorMessage.value = "";
    logEvent("discovery.fetch_start", {
      selectedWikiInstanceId: selectedWikiInstance.id,
      discoveryUrl: `${selectedWikiInstance.baseUrl}/w/rest.php/specs/v0/discovery`,
      proxyUrl: `/api/discovery?wikiInstanceId=${selectedWikiInstance.id}`
    });
    try {
      const discoveryResponse = await $fetch("/api/discovery", {
        query: {
          wikiInstanceId: selectedWikiInstance.id
        }
      });
      const normalizedModules = normalizeDiscoveryModules(discoveryResponse.modules, selectedWikiInstance.baseUrl);
      discoveryCacheByInstance.set(selectedWikiInstance.id, normalizedModules);
      modules.value = normalizedModules;
      logEvent("discovery.fetch_success", {
        selectedWikiInstanceId: selectedWikiInstance.id,
        moduleCount: normalizedModules.length
      });
    } catch (error) {
      modules.value = [];
      hasError.value = true;
      errorMessage.value = error instanceof Error ? error.message : "Discovery request failed.";
      logEvent("discovery.fetch_error", {
        selectedWikiInstanceId: selectedWikiInstance.id,
        errorMessage: errorMessage.value
      });
    } finally {
      isLoading.value = false;
    }
  }
  watch(selectedWikiInstanceId, () => {
    void fetchDiscoveryModules();
  }, { immediate: true });
  return {
    isLoading,
    hasError,
    errorMessage,
    modules: computed(() => modules.value),
    refetchDiscovery: fetchDiscoveryModules
  };
}
function useWikiModules(selectedWikiInstanceId) {
  const { modules, isLoading, hasError, errorMessage, refetchDiscovery } = useDiscovery(selectedWikiInstanceId);
  const moduleOptions = computed(() => {
    return modules.value.map((moduleItem) => ({
      value: moduleItem.name,
      label: moduleItem.version ? `${moduleItem.title ?? moduleItem.name} (${moduleItem.version.startsWith("v") ? moduleItem.version : `v${moduleItem.version}`})` : moduleItem.title ?? moduleItem.name,
      specUrl: moduleItem.specUrl
    }));
  });
  return {
    moduleOptions,
    isLoading,
    hasError,
    errorMessage,
    refetchDiscovery
  };
}
function useSpecUrl(selectedWikiInstanceId, selectedModuleName) {
  const { moduleOptions, isLoading, hasError, errorMessage, refetchDiscovery } = useWikiModules(selectedWikiInstanceId);
  const openApiSpecUrl = computed(() => {
    const selectedModuleOption = moduleOptions.value.find((moduleOption) => moduleOption.value === selectedModuleName.value);
    return selectedModuleOption?.specUrl ?? null;
  });
  return {
    openApiSpecUrl,
    moduleOptions,
    isLoading,
    hasError,
    errorMessage,
    refetchDiscovery
  };
}
const SCALAR_DEFAULT_CONFIGURATION = {
  hideDownloadButton: false,
  hideTestRequestButton: false,
  showDeveloperTools: "never",
  layout: "modern",
  theme: "default",
  showSidebar: true,
  searchHotKey: "k",
  metaData: {
    title: "Front Door API Explorer"
  }
};
function useScalarConfig(openApiSpecUrl) {
  const { logEvent } = useExplorerDiagnostics();
  const scalarConfiguration = reactive({
    ...SCALAR_DEFAULT_CONFIGURATION,
    spec: {
      url: openApiSpecUrl.value ?? ""
    }
  });
  watch(openApiSpecUrl, (nextOpenApiSpecUrl) => {
    if (!nextOpenApiSpecUrl) {
      return;
    }
    Object.assign(scalarConfiguration, {
      spec: {
        url: nextOpenApiSpecUrl
      }
    });
    logEvent("scalar.config_updated", {
      updateStrategy: "object_assign",
      specUrl: nextOpenApiSpecUrl
    });
  }, { immediate: true });
  return {
    scalarConfiguration
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { $i18n } = useNuxtApp();
    const { selectedWikiInstanceId } = useDirection();
    const selectedModuleName = ref("");
    const { entries: diagnosticsEntries, logEvent } = useExplorerDiagnostics();
    function isolateLabel(label) {
      return `⁨${label}⁩`;
    }
    const wikiInstanceMenuItems = computed(() => {
      return WIKI_INSTANCES.map((wikiInstance) => ({
        value: wikiInstance.id,
        label: isolateLabel(wikiInstance.displayName)
      }));
    });
    const {
      openApiSpecUrl,
      moduleOptions,
      isLoading,
      hasError,
      errorMessage,
      refetchDiscovery
    } = useSpecUrl(selectedWikiInstanceId, selectedModuleName);
    const moduleMenuItems = computed(() => {
      return moduleOptions.value.map((moduleOption) => ({
        value: moduleOption.value,
        label: isolateLabel(moduleOption.label)
      }));
    });
    watch(moduleMenuItems, (nextModuleMenuItems) => {
      if (!nextModuleMenuItems.length) {
        selectedModuleName.value = "";
        return;
      }
      const hasSelectedModule = nextModuleMenuItems.some((moduleMenuItem) => moduleMenuItem.value === selectedModuleName.value);
      if (!hasSelectedModule) {
        selectedModuleName.value = nextModuleMenuItems[0].value;
      }
    }, { immediate: true });
    useScalarConfig(openApiSpecUrl);
    watch(selectedWikiInstanceId, (nextSelectedWikiInstanceId) => {
      logEvent("ui.instance_changed", {
        selectedWikiInstanceId: nextSelectedWikiInstanceId
      });
    });
    watch(selectedModuleName, (nextSelectedModuleName) => {
      logEvent("ui.module_changed", {
        selectedModuleName: nextSelectedModuleName
      });
    });
    const explorerTitle = computed(() => $i18n("explorer-title"));
    const explorerDescription = computed(() => $i18n("explorer-description"));
    const instanceLabel = computed(() => $i18n("explorer-instance-label"));
    const moduleLabel = computed(() => $i18n("explorer-module-label"));
    const loadingModulesLabel = computed(() => $i18n("explorer-loading-modules"));
    const modulePlaceholderLabel = computed(() => $i18n("explorer-module-placeholder"));
    const instancePlaceholderLabel = computed(() => $i18n("explorer-instance-placeholder"));
    const refreshButtonLabel = computed(() => $i18n("explorer-refresh-button"));
    const emptyModulesLabel = computed(() => $i18n("explorer-empty-modules"));
    const discoveryErrorLabel = computed(() => $i18n("explorer-discovery-error"));
    const missingSpecLabel = computed(() => $i18n("explorer-spec-missing"));
    const diagnosticsTitle = computed(() => $i18n("explorer-debug-title"));
    const diagnosticsEmptyLabel = computed(() => $i18n("explorer-debug-empty"));
    computed(() => $i18n("explorer-loading-interface"));
    const hasModules = computed(() => moduleMenuItems.value.length > 0);
    shallowRef(null);
    ref(false);
    function onRetryDiscovery() {
      void refetchDiscovery();
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "explorer-page" }, _attrs))} data-v-eeaa9943><header class="explorer-page__header" data-v-eeaa9943><h1 data-v-eeaa9943>${ssrInterpolate(explorerTitle.value)}</h1><p data-v-eeaa9943>${ssrInterpolate(explorerDescription.value)}</p></header><section class="explorer-page__controls-panel" data-v-eeaa9943>`);
      _push(ssrRenderComponent(unref(CdxField), { class: "explorer-page__control-item" }, {
        label: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(instanceLabel.value)}`);
          } else {
            return [
              createTextVNode(toDisplayString(instanceLabel.value), 1)
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(CdxSelect), {
              selected: unref(selectedWikiInstanceId),
              "onUpdate:selected": ($event) => isRef(selectedWikiInstanceId) ? selectedWikiInstanceId.value = $event : null,
              "menu-items": wikiInstanceMenuItems.value,
              "default-label": instancePlaceholderLabel.value
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(unref(CdxSelect), {
                selected: unref(selectedWikiInstanceId),
                "onUpdate:selected": ($event) => isRef(selectedWikiInstanceId) ? selectedWikiInstanceId.value = $event : null,
                "menu-items": wikiInstanceMenuItems.value,
                "default-label": instancePlaceholderLabel.value
              }, null, 8, ["selected", "onUpdate:selected", "menu-items", "default-label"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(CdxField), { class: "explorer-page__control-item" }, {
        label: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(moduleLabel.value)}`);
          } else {
            return [
              createTextVNode(toDisplayString(moduleLabel.value), 1)
            ];
          }
        }),
        "help-text": withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(isLoading) ? loadingModulesLabel.value : hasModules.value ? explorerDescription.value : emptyModulesLabel.value)}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(isLoading) ? loadingModulesLabel.value : hasModules.value ? explorerDescription.value : emptyModulesLabel.value), 1)
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(CdxSelect), {
              selected: unref(selectedModuleName),
              "onUpdate:selected": ($event) => isRef(selectedModuleName) ? selectedModuleName.value = $event : null,
              "menu-items": moduleMenuItems.value,
              "default-label": modulePlaceholderLabel.value,
              disabled: unref(isLoading) || !hasModules.value
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(unref(CdxSelect), {
                selected: unref(selectedModuleName),
                "onUpdate:selected": ($event) => isRef(selectedModuleName) ? selectedModuleName.value = $event : null,
                "menu-items": moduleMenuItems.value,
                "default-label": modulePlaceholderLabel.value,
                disabled: unref(isLoading) || !hasModules.value
              }, null, 8, ["selected", "onUpdate:selected", "menu-items", "default-label", "disabled"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(hasError)) {
        _push(`<div class="explorer-page__action-row" data-v-eeaa9943>`);
        _push(ssrRenderComponent(unref(CdxButton), {
          weight: "primary",
          onClick: onRetryDiscovery
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(refreshButtonLabel.value)}`);
            } else {
              return [
                createTextVNode(toDisplayString(refreshButtonLabel.value), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section><section class="explorer-page__reference-panel" data-v-eeaa9943>`);
      if (unref(isLoading)) {
        _push(ssrRenderComponent(unref(CdxMessage), { type: "notice" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(loadingModulesLabel.value)}`);
            } else {
              return [
                createTextVNode(toDisplayString(loadingModulesLabel.value), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (unref(hasError)) {
        _push(ssrRenderComponent(unref(CdxMessage), { type: "error" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(discoveryErrorLabel.value)} <bdi data-v-eeaa9943${_scopeId}>${ssrInterpolate(unref(errorMessage))}</bdi>`);
            } else {
              return [
                createTextVNode(toDisplayString(discoveryErrorLabel.value) + " ", 1),
                createVNode("bdi", null, toDisplayString(unref(errorMessage)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (!hasModules.value) {
        _push(ssrRenderComponent(unref(CdxMessage), { type: "warning" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(emptyModulesLabel.value)}`);
            } else {
              return [
                createTextVNode(toDisplayString(emptyModulesLabel.value), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (!unref(openApiSpecUrl)) {
        _push(ssrRenderComponent(unref(CdxMessage), { type: "warning" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(missingSpecLabel.value)}`);
            } else {
              return [
                createTextVNode(toDisplayString(missingSpecLabel.value), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (unref(openApiSpecUrl)) {
        _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</section><aside class="explorer-page__diagnostics" data-v-eeaa9943><h2 data-v-eeaa9943>${ssrInterpolate(diagnosticsTitle.value)}</h2>`);
      if (!unref(diagnosticsEntries).length) {
        _push(`<p data-v-eeaa9943>${ssrInterpolate(diagnosticsEmptyLabel.value)}</p>`);
      } else {
        _push(`<ol data-v-eeaa9943><!--[-->`);
        ssrRenderList(unref(diagnosticsEntries), (diagnosticsEntry) => {
          _push(`<li data-v-eeaa9943><strong data-v-eeaa9943>${ssrInterpolate(diagnosticsEntry.event)}</strong><pre data-v-eeaa9943>${ssrInterpolate(JSON.stringify(diagnosticsEntry.details, null, 2))}</pre></li>`);
        });
        _push(`<!--]--></ol>`);
      }
      _push(`</aside></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/explorer/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-eeaa9943"]]);

export { index as default };
//# sourceMappingURL=index-DUEergwm.mjs.map
