type Listener<T> = (data: T) => void;

export class EventEmitter<T_Events extends Record<string, any>> {
  private listeners: { [K in keyof T_Events]?: Listener<T_Events[K]>[] } = {};

  on<K extends keyof T_Events>(event: K, listener: Listener<T_Events[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  off<K extends keyof T_Events>(event: K, listener: Listener<T_Events[K]>): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event]!.filter(l => l !== listener);
  }

  emit<K extends keyof T_Events>(event: K, data: T_Events[K]): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event]!.forEach(listener => listener(data));
  }
}
