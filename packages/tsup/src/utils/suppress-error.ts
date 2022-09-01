export function suppressError<T extends (...args: unknown[]) => unknown>(
  func: T,
  returnValueWhenError: ReturnType<T>
): ReturnType<T> {
  try {
    return func() as ReturnType<T>;
  } catch (error) {
    return returnValueWhenError;
  }
}
