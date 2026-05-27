import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot } from 'vue/server-renderer';
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
  __name: "Alert",
  __ssrInlineRender: true,
  props: {
    color: {
      type: String,
      default: "orange"
    }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "alert",
        style: { "border-color": __props.color }
      }, _attrs))} data-v-46dbbe98>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Alert.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Alert = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-46dbbe98"]]), { __name: "Alert" });

export { Alert as default };
//# sourceMappingURL=Alert-BiPlNT6O.mjs.map
