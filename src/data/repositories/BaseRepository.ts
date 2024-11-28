export default abstract class BaseRepository<T> {
  protected items: T[] = []

  /**
   * @constructs BaseRepository<T>
   */
  public constructor() {}

  /**
   * Adds an item of type T to the repository.
   * @param item - The item to add.
   */
  public add(item: T): void {
    this.items.push(item)
  }

  /**
   * Gets all items in the repository.
   * @returns An array of items of type T.
   */
  public getAll(): T[] {
    return this.items
  }

  /**
   * Finds an item by predicate function.
   * @param predicate - A function to test each element.
   * @returns The first item that matches the predicate or undefined.
   */
  public find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate)
  }
}
