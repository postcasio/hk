export default interface Comparable<T> {
  compare(other: T): number;
}

export function isComparable<T>(object: any): object is Comparable<T> {
  return (
    object &&
    typeof object === 'object' &&
    'compare' in (object as {}) &&
    typeof (object as { compare?: any }).compare === 'function'
  );
}
