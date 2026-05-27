import { _ as __nuxt_component_0 } from './nuxt-link-DlxCFwxX.mjs';
import { defineComponent, computed, mergeProps, withCtx, unref, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { u as useDirection } from './useDirection-By8KVeOx.mjs';
import { a as _export_sfc, d as useNuxtApp } from './server.mjs';
import { u as useHead } from './composables-D06Sp2mu.mjs';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const { direction } = useDirection();
    const { $i18n } = useNuxtApp();
    const applicationTitle = computed(() => $i18n("app-title"));
    const homeNavigationLabel = computed(() => $i18n("nav-home"));
    const aboutNavigationLabel = computed(() => $i18n("nav-about"));
    const apiNavigationLabel = computed(() => $i18n("nav-api"));
    const footerLabel = computed(() => $i18n("footer-title"));
    useHead({
      htmlAttrs: {
        dir: direction,
        lang: "en"
      },
      title: applicationTitle
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "frontdoor-shell" }, _attrs))} data-v-9d5423d0><header class="frontdoor-shell__header" data-v-9d5423d0><div class="frontdoor-shell__header-inner" data-v-9d5423d0>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "frontdoor-shell__brand"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(applicationTitle))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(applicationTitle)), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<nav class="frontdoor-shell__nav" data-v-9d5423d0>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(homeNavigationLabel))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(homeNavigationLabel)), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/about" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(aboutNavigationLabel))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(aboutNavigationLabel)), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/explorer" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(apiNavigationLabel))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(apiNavigationLabel)), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</nav></div></header><main class="frontdoor-shell__main" data-v-9d5423d0>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main><footer class="frontdoor-shell__footer" data-v-9d5423d0>${ssrInterpolate(unref(footerLabel))}</footer></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-9d5423d0"]]);

export { _default as default };
//# sourceMappingURL=default-B0Rq_MkY.mjs.map
