
export function generateId(): string {
  return self.crypto.randomUUID();
}

export function generateRollNumber(): string {
  const array = new Uint32Array(1);
  self.crypto.getRandomValues(array);
  const randomNumber = 1000 + (array[0] % 9000);
  return `RN-${randomNumber}`;
}
