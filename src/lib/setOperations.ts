export function performSetOperation(
  operation: 'union' | 'intersection' | 'difference' | null,
  selectedNames: string[],
  recordNames: string[]
): boolean {
  if (!operation || selectedNames.length === 0) return true;

  const selectedNamesLower = selectedNames.map(name => name.toLowerCase());
  const recordNamesLower = recordNames.map(name => name.toLowerCase());

  let result = false;
  switch (operation) {
    case 'union':
      result = selectedNamesLower.some(name => recordNamesLower.includes(name));
      break;

    case 'intersection':
      result = selectedNamesLower.every(name => recordNamesLower.includes(name));
      break;

    case 'difference':
      // Show records whose parents are NOT in the selected set
      result = !selectedNamesLower.some(name => recordNamesLower.includes(name));
      break;

    default:
      result = true;
  }

  return result;
}