type ChangeListener = () => void;

function createChangeEvent() {
  const listeners = new Set<ChangeListener>();

  return {
    emit() {
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: ChangeListener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

const taskChanged = createChangeEvent();
const todoChanged = createChangeEvent();
const habitChanged = createChangeEvent();

export const emitTaskChanged = taskChanged.emit;
export const onTaskChanged = taskChanged.subscribe;
export const emitTodoChanged = todoChanged.emit;
export const onTodoChanged = todoChanged.subscribe;
export const emitHabitChanged = habitChanged.emit;
export const onHabitChanged = habitChanged.subscribe;
