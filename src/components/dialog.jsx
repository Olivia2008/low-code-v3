import { createVNode, defineComponent, render, reactive } from "vue";
import { ElDialog, ElInput, ElButton } from "element-plus";
const DialogComponent = defineComponent({
  props: {
    option: { type: Object },
  },

  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
    });
    ctx.expose({
      showDialog(option) {
        state.option = option;
        // 让外面可以调用
        state.isShow = true;
      },
    });
    const onCancel = () => {
      state.isShow = false;
    };
    const onConfirm = () => {
      state.isShow = false;
      state.option.onConfirm && state.option.onConfirm(state.option.content);
    };
    return () => {
      return (
        <ElDialog v-model={state.isShow} title={state.option.title}>
          {{
            default: () => (
              <ElInput
                type="textarea"
                v-model={state.option.content}
                rows={10}></ElInput>
            ),
            footer: () =>
              state.option.footer && (
                <div>
                  <ElButton onClick={onCancel}>取消</ElButton>
                  <ElButton type="primary" onClick={onConfirm}>
                    确定
                  </ElButton>
                </div>
              ),
          }}
        </ElDialog>
      );
    };
  },
});

let vm;
export function $dialog(option) {
  // 手动挂载组件
  if (!vm) {
    let el = document.createElement("div");
    vm = createVNode(DialogComponent, { option }); // 将组件渲染成虚拟节点
    document.body.appendChild((render(vm, el), el)); // 渲染成真实节点为到页面中
  }

  // 将组件渲染到这个el元素上
  let { showDialog } = vm.component.exposed;
  showDialog(option);
}
