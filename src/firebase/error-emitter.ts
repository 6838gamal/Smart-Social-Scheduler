type Events = {
  'permission-error': (error: any) => void;
};

class EventEmitter<T extends Record<string, (...args: any[]) => void>> {
  private listeners: { [K in keyof T]?: T[K][] } = {};

  on<K extends keyof T>(event: K, listener: T[K]): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  off<K extends keyof T>(event: K, listener: T[K]): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event]!.filter(
      (l) => l !== listener
    );
  }

  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event]!.forEach((listener) => {
      listener(...args);
    });
  }
}

export const errorEmitter = new EventEmitter<Events>();
