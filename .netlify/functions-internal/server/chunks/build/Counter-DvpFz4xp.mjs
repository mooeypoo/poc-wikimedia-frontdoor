import { defineComponent, ref, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
import { a as _export_sfc } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Counter",
  __ssrInlineRender: true,
  setup(__props) {
    const count = ref(0);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-5c5d582e><h3 data-v-5c5d582e>Counter: ${ssrInterpolate(unref(count))}</h3><button data-v-5c5d582e> Increment </button><button data-v-5c5d582e> Decrement </button></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Counter.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Counter = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-5c5d582e"]]), { __name: "Counter" });

export { Counter as default };
//# sourceMappingURL=Counter-DvpFz4xp.mjs.map
