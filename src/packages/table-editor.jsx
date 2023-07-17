import { defineComponent, computed } from "vue";
import { $tableDialog } from "../components/tableDialog";
import { ElButton, ElTag } from "element-plus";
export default defineComponent({
  props: {
    propConfig: { type: Object },
    modelValue: { type: Array },
  },
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue || [];
      },
      set(newval) {
        ctx.emit("update:modelValue", JSON.parse(JSON.stringify(newval)));
      },
    });
    const add = () => {
      $tableDialog({
        config: props.propConfig,
        data: data.value,
        onConfirm(v) {
          data.value = v;
        },
      });
    };
    const reset = () => {};
    return () => (
      <div>
        {(!data.value || data.value.length === 0) && (
          <div>
            <ElButton onClick={() => add()}>添加</ElButton>
            <ElButton onClick={() => reset()}>重置</ElButton>
          </div>
        )}
        {(data.value || []).map((item) => (
          <ElTag onClick={add}>{item[props.propConfig.table.key]}</ElTag>
        ))}
      </div>
    );
  },
});
