/**
 * BaseTransformer
 */
export default abstract class BaseTransformer {
  /**
   * Transform data
   * @param data
   */
  public data(data: object) {
    return data
  }

  /**
   * Transform a collection
   * @param {any[]} collection
   * @param nextStartKey
   */
  public collection<T>(collection: object[]): {
    items: unknown[]
    total?: number
  } {
    return {
      items: collection.map(item => this.data(item)) as T[],
      total: collection.length,
    }
  }
}
