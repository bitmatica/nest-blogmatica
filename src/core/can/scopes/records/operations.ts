// abstract class Comparator<T, U> {
//   constructor(private fieldName: string, private valueName: string) {}
//
//   abstract compare(fieldValue: T, compareValue: U): boolean
//
//   abstract compareStatement(fieldName: string, valueName: string): string
// }
//
// class EqualsComparator<T> extends Comparator<T, T> {
//   compare(fieldValue: T, compareValue: T): boolean {
//     return fieldValue === compareValue
//   }
//
//   compareStatement(fieldName: string, valueName: string): string {
//     return `${fieldName} = ${valueName}`
//   }
// }
//
// class GreaterThanComparator<T> extends Comparator<T, T> {
//   compare(fieldValue: T, compareValue: T): boolean {
//     return fieldValue > compareValue
//   }
//
//   compareStatement(fieldName: string, valueName: string): string {
//     return `${fieldName} > ${valueName}`
//   }
// }
//
// class LessThanComparator<T> extends Comparator<T, T> {
//   compare(fieldValue: T, compareValue: T): boolean {
//     return fieldValue < compareValue
//   }
//
//   compareStatement(fieldName: string, valueName: string): string {
//     return `${fieldName} < ${valueName}`
//   }
// }
//
// class InComparator<T, U extends Array<T>> extends Comparator<T, U> {
//   compare(fieldValue: T, compareValue: U): boolean {
//     return compareValue.indexOf(fieldValue) >= 0
//   }
//
//   compareStatement(fieldName: string, valueName: string): string {
//     return `${fieldName} IN ${valueName}`
//   }
// }
