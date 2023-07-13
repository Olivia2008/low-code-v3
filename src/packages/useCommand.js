import { events } from "./events";
import { onUnmounted } from "vue";
export function useCommand(data, focusData) {
  // 前进后退指针
  const state = {
    current: -1, // 前进后退索引
    queue: [], // 存放所有的操作命令
    commands: {}, // 制作命令和执行功能一个映射表
    commandArray: [], // 存放所有命令
    destoryArray: [],
  };
  const registry = (command) => {
    state.commandArray.push(command);
    state.commands[command.name] = (...args) => {
      // 命令名字对应执行函数
      const { redo, undo } = command.execute(...args);
      redo();
      if (!command.pushQueue) {
        return;
      }
      let { queue, current } = state;
      if (queue.length > 0) {
        queue = queue.slice(0, current + 1);
        state.queue = queue;
      }

      queue.push({ redo, undo });
      state.current = current + 1;
    };
  };
  // 重做
  registry({
    name: "redo",
    keyboard: "ctr+y",
    execute() {
      return {
        redo() {
          let item = state.queue[state.current + 1];
          if (item) {
            item.redo && item.redo();
            state.current++;
          }
        },
      };
    },
  });
  // 撤销
  registry({
    name: "undo",
    keyboard: "ctr+z",
    execute() {
      return {
        redo() {
          if (state.current === -1) return;
          let item = state.queue[state.current];
          if (item) {
            item.undo && item.undo();
            state.current--;
          }
        },
      };
    },
  });
  // 注册拖拽
  registry({
    // 如果将操作放到队列中可以增加一个属性标识，等会操作要放到队列中
    name: "drag",
    pushQueue: true,
    init() {
      // 初始化默认会执行
      this.before = null;
      // 监控拖拽开始事件，保存状态
      const start = () =>
        (this.before = JSON.parse(JSON.stringify(data.value.blocks)));
      // 拖拽之后需要触发对应的指令
      const end = () => state.commands.drag();
      events.on("start", start);
      events.on("end", end);
      return () => {
        events.off("start", start);
        events.off("end", end);
      };
    },
    execute() {
      // state.commands.drag()
      let before = this.before;
      let after = data.value.blocks;
      return {
        redo() {
          // 松手直接把当前事情做了
          data.value = { ...data.value, blocks: after };
        },
        undo() {
          data.value = { ...data.value, blocks: before };
        },
      };
    },
  });
  // 带有历史记录
  registry({
    name: "updateContainer",
    pushQueue: true,
    execute(newValue) {
      let state = {
        before: data.value,
        after: newValue,
      };
      return {
        redo: () => {
          data.value = state.after;
        },
        undo: () => {
          data.value = state.before;
        },
      };
    },
  });
  // 更新某一个渲染模块
  registry({
    name: "updateBlock",
    pushQueue: true,
    execute(newValue, oldValue) {
      let state = {
        before: data.value.blocks,
        after: (() => {
          let blocks = [...data.value.blocks];
          const index = data.value.blocks.indexOf(oldValue);
          if (index > -1) {
            blocks.splice(index, 1, newValue);
          }
          return blocks;
        })(),
      };
      return {
        redo: () => {
          data.value = { ...data.value, blocks: state.after };
        },
        undo: () => {
          data.value = { ...data.value, blocks: state.before };
        },
      };
    },
  });
  // 置顶
  registry({
    name: "placeTop",
    pushQueue: true,
    execute() {
      let state = {
        before: JSON.parse(JSON.stringify(data.value.blocks)),
        after: (() => {
          // 找出渲染块中顶级最大的
          let { focusList, blurList } = focusData.value;
          let maxZIndex = blurList.reduce((prev, block) => {
            return Math.max(prev, block.zIndex);
          }, -Infinity);
          focusList.forEach((block) => (block.zIndex = maxZIndex + 1));
          return data.value.blocks;
        })(),
      };
      return {
        redo: () => {
          data.value = { ...data.value, blocks: state.after };
        },
        undo: () => {
          data.value = { ...data.value, blocks: state.before };
        },
      };
    },
  });
  // 置底
  registry({
    name: "placeBottom",
    pushQueue: true,
    execute() {
      let state = {
        before: JSON.parse(JSON.stringify(data.value.blocks)),
        after: (() => {
          // 找出渲染块中顶级最大的
          let { focusList, blurList } = focusData.value;
          let minZIndex =
            blurList.reduce((prev, block) => {
              return Math.min(prev, block.zIndex);
            }, Infinity) - 1;
          const min = Math.abs(minZIndex);
          if (minZIndex < 0) {
            minZIndex = 0;
            blurList.forEach((block) => (block.zIndex += min));
          }
          focusList.forEach((block) => (block.zIndex = minZIndex));
          return data.value.blocks;
        })(),
      };
      return {
        redo: () => {
          data.value = { ...data.value, blocks: state.after };
        },
        undo: () => {
          data.value = { ...data.value, blocks: state.before };
        },
      };
    },
  });
  // 删除
  registry({
    name: "delete",
    pushQueue: true,
    execute() {
      let state = {
        before: data.value.blocks,
        after: focusData.value.blurList,
      };
      return {
        redo: () => {
          data.value = { ...data.value, blocks: state.after };
        },
        undo: () => {
          data.value = { ...data.value, blocks: state.before };
        },
      };
    },
  });
  const keyboardEvent = (() => {
    const keyCodes = {
      90: "z",
      89: "y",
    };
    const onKeydown = (e) => {
      const { ctrlKey, keyCode } = e; // ctr+z, ctr+y
      let keyString = [];
      if (ctrlKey) keyString.push("ctr");

      keyString.push(keyCodes[keyCode]);
      keyString = keyString.join("+");

      state.commandArray.forEach(({ keyboard, name }) => {
        if (!keyboard) return;
        if (keyboard === keyString) {
          state.commands[name]();
          e.preventDefault();
        }
      });
    };
    const init = () => {
      window.addEventListener("keydown", onKeydown);
      return () => {
        window.removeEventListener("keydown", onKeydown);
      };
    };
    return init;
  })();
  (() => {
    // 监听键盘事件
    state.destoryArray.push(keyboardEvent());
    state.commandArray.forEach(
      (command) => command.init && state.destoryArray.push(command.init())
    );
  })();
  onUnmounted(() => {
    state.destoryArray.forEach((fn) => fn && fn());
  });
  return state;
}
