import { computed, ref } from "vue";
export function useFocus(data, previewRef, callback) {
  // 没有任何一个被选中
  const selectIndex = ref(-1);
  const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value]);
  const focusData = computed(() => {
    let focusList = [];
    let blurList = [];
    data.value.blocks.forEach((block) =>
      (block.focus ? focusList : blurList).push(block)
    );
    return { focusList, blurList };
  });
  const clearBlockFocus = () => {
    data.value.blocks.forEach((block) => (block.focus = false));
  };
  const containerMousedown = () => {
    if (previewRef.value) return;
    clearBlockFocus();
    selectIndex.value = -1;
  };
  const blockMouseDown = (e, block, index) => {
    if (previewRef.value) return;
    // 阻止mousedown默认行为
    e.preventDefault();
    // 阻止冒泡
    e.stopPropagation();
    if (e.shiftKey) {
      if (focusData.value.focusList.length <= 1) {
        block.focus = true;
      } else {
        block.focus = !block.focus;
      }
    } else {
      // 给每个元素添加是否聚焦
      if (!block.focus) {
        // 清除上一个焦点
        clearBlockFocus();
        block.focus = true;
      }
    }
    selectIndex.value = index;
    callback(e);
  };

  return {
    focusData,
    containerMousedown,
    blockMouseDown,
    lastSelectBlock,
    clearBlockFocus,
  };
}
