import { q as queryCollection, _ as __nuxt_component_0 } from './client-DAiMLEij.mjs';
import { defineComponent, withAsyncContext, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { f as useRoute, u as useAsyncData, c as createError } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'better-sqlite3';
import 'property-information';
import 'minimark/hast';
import 'pinia';
import 'vue-router';
import 'perfect-debounce';
import '@vue/shared';
import 'banana-i18n';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[...slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const { data: page } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "page-" + route.path,
      () => {
        return queryCollection("content").path(route.path).first();
      },
      "$M-QvQ46f7U"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    if (!page.value) {
      throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ContentRenderer = __nuxt_component_0;
      if (unref(page)) {
        _push(ssrRenderComponent(_component_ContentRenderer, mergeProps({ value: unref(page) }, _attrs), null, _parent));
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/[...slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_...slug_-B7tVzDWO.mjs.map
