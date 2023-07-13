import {
  provide,
  inject,
  createVNode,
  defineComponent,
  render,
  reactive,
  computed,
  ref,
  onMounted,
  onBeforeUnmount,
} from "vue";

export const DropdownItem = defineComponent({
  props: {
    label: String,
    icon: String,
  },
  setup(props) {
    // eslint-disable-next-line vue/no-setup-props-destructure
    let { label, icon } = props;
    // 子元素接收数据
    let hide = inject("hide");
    return () => (
      <div class="dropdown-item" onClick={hide}>
        <i class={`icon iconfont ${icon}`} style="margin-right:3px;"></i>
        <span>{label}</span>
      </div>
    );
  },
});
export const DropDownComponent = defineComponent({
  props: {
    option: { type: Object },
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
      top: 0,
      left: 0,
    });
    ctx.expose({
      showDropdown(option) {
        state.option = option;
        state.isShow = true;
        let { top, left, height } = option.el.getBoundingClientRect();
        state.top = top + height;
        state.left = left;
      },
    });
    // 父元素注入数据
    provide("hide", () => (state.isShow = false));

    const classes = computed(() => [
      "dropdown",
      {
        "dropdown-isShow": state.isShow,
      },
    ]);
    const styles = computed(() => ({
      top: state.top + "px",
      left: state.left + "px",
    }));

    const el = ref(null);
    const onMousedown = (e) => {
      if (!el.value.contains(e.target)) {
        state.isShow = false;
      }
    };
    onMounted(() => {
      // 事件传递行为是先捕获再冒泡
      document.body.addEventListener("mousedown", onMousedown, true);
    });

    onBeforeUnmount(() => {
      document.body.removeEventListener("mousedown", onMousedown);
    });
    return () => {
      return (
        <div class={classes.value} style={styles.value} ref={el}>
          {state.option.content()}
        </div>
      );
    };
  },
});

let vm;
export function $dropDown(option) {
  // 手动挂载组件
  if (!vm) {
    let el = document.createElement("div");
    vm = createVNode(DropDownComponent, { option }); // 将组件渲染成虚拟节点
    document.body.appendChild((render(vm, el), el)); // 渲染成真实节点为到页面中
  }

  // 将组件渲染到这个el元素上
  let { showDropdown } = vm.component.exposed;
  showDropdown(option);
}
