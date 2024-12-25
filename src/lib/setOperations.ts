export function performSetOperation(
  operation: 'union' | 'intersection' | 'difference' | null,
  selectedNames: string[],
  recordNames: string[],
  debug = true
): boolean {
  if (!operation || selectedNames.length === 0) return true;

  // Convert arrays to lowercase for case-insensitive comparison
  const selectedNamesLower = selectedNames.map(name => name.toLowerCase());
  const recordNamesLower = recordNames.map(name => name.toLowerCase());

  // Always log operation details for debugging
  console.group('Set Operation Details');
  console.log('Operation:', operation);
  console.log('Selected names:', selectedNames);
  console.log('Record names:', recordNames);

  if (debug) {
    console.group('\nSet Operation Details');
    console.log('Operation type:', operation);
    console.log('Selected names:', selectedNames);
    console.log('Record names:', recordNames);
    console.log('Selected names (lowercase):', selectedNamesLower);
    console.log('Record names (lowercase):', recordNamesLower);
  }

  let result = false;
  switch (operation) {
    case 'union':
      // Show records that have ANY of the selected names
      result = selectedNamesLower.some(name => recordNamesLower.includes(name));
      console.log('Union result:', result);
      break;

    case 'intersection':
      // Show records that have ALL of the selected names
      result = selectedNamesLower.every(name => recordNamesLower.includes(name));
      console.log('Intersection result:', result);
      console.log('Details:');
      selectedNamesLower.forEach(name => {
        console.log(`- "${name}" exists in record:`, recordNamesLower.includes(name));
      });
      break;

    case 'difference':
      // Show records that have NONE of the selected names
      result = !selectedNamesLower.some(name => recordNamesLower.includes(name));
      console.log('Difference result:', result);
      break;

    default:
      console.log('No operation specified, returning true');
      result = true;
  }

  console.groupEnd();
  return result;
}