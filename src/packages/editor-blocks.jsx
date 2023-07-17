import { defineComponent, computed, inject, ref, onMounted } from "vue";
import BlockReszie from "./block-resize.jsx";
export default defineComponent({
  props: {
    block: { type: Object },
    formData: { type: Object },
  },
  setup(props) {
    const blockStyles = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: `${props.block.zIndex}`,
    }));
    const blockRef = ref(null);
    const config = inject("config");
    onMounted(() => {
      let { offsetWidth, offsetHeight } = blockRef.value;
      if (props.block.alignCenter) {
        // eslint-disable-next-line vue/no-mutating-props
        props.block.left = props.block.left - offsetWidth / 2;
        // eslint-disable-next-line vue/no-mutating-props
        props.block.top = props.block.top - offsetHeight / 2;
        // eslint-disable-next-line vue/no-mutating-props
        props.block.alignCenter = false;
      }
      // eslint-disable-next-line vue/no-mutating-props
      props.block.width = offsetWidth;
      // eslint-disable-next-line vue/no-mutating-props
      props.block.height = offsetHeight;
    });
    return () => {
      const component = config.componentMap[props.block.key];
      const RenderComponent = component.render({
        props: props.block.props,
        size: props.block.hasResize
          ? { width: props.block.width, height: props.block.height }
          : {},
        model: Object.keys(component.model || {}).reduce((prev, modelName) => {
          let propName = props.block.model[modelName];
          prev[modelName] = {
            modelValue: props.formData[propName],
            // eslint-disable-next-line vue/no-mutating-props
            "onUpdate:modelValue": (v) => (props.formData[propName] = v),
          };
          return prev;
        }, {}),
      });
      let { width, height } = component.resize || {};
      return (
        <div class="editor-block" style={blockStyles.value} ref={blockRef}>
          {RenderComponent}
          {props.block.focus && (width || height) && (
            <BlockReszie
              block={props.block}
              component={component}></BlockReszie>
          )}
        </div>
      );
    };
  },
});
