export interface ILazyInitializer<T> {
  (): T
}

export class Lazy<T> {
  private instance: T | null = null
  private initializer: ILazyInitializer<T>

  constructor(initializer: ILazyInitializer<T>) {
      this.initializer = initializer
  }

  public get value(): T {
      if (this.instance == null) {
          this.instance = this.initializer()
      }

      return this.instance
  }
}

export interface IAsyncLazyInitializer<T> {
  (): Promise<T>
}

export class AsyncLazy<T> {
  private instance: T | null = null
  private initializer: IAsyncLazyInitializer<T>

  constructor(initializer: IAsyncLazyInitializer<T>) {
      this.initializer = initializer
  }

  public async get(): Promise<T> {
      if (this.instance == null) {
          this.instance = await this.initializer()
      }

      return this.instance
  }
}
