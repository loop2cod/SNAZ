export interface ParsedBagFormat {
  nonVegCount: number;
  vegCount: number;
  totalCount: number;
}

export function parseBagFormat(bagFormat: string): ParsedBagFormat {
  try {
    // Remove spaces and convert to lowercase
    const cleaned = bagFormat.replace(/\s/g, '').toLowerCase();
    
    let nonVegCount = 0;
    let vegCount = 0;
    
    // Split by '+' to separate veg and non-veg
    const parts = cleaned.split('+');
    
    if (parts.length === 1) {
      // Only non-veg or only numbers separated by commas
      const numbers = parts[0].split(',').map(num => parseInt(num.trim()) || 0);
      nonVegCount = numbers.reduce((sum, num) => sum + num, 0);
    } else if (parts.length === 2) {
      // First part is non-veg, second part is veg
      const nonVegNumbers = parts[0].split(',').map(num => parseInt(num.trim()) || 0);
      nonVegCount = nonVegNumbers.reduce((sum, num) => sum + num, 0);
      
      const vegNumbers = parts[1].split(',').map(num => parseInt(num.trim()) || 0);
      vegCount = vegNumbers.reduce((sum, num) => sum + num, 0);
    }
    
    const totalCount = nonVegCount + vegCount;
    
    return {
      nonVegCount,
      vegCount,
      totalCount
    };
  } catch (error) {
    console.error('Error parsing bag format:', error);
    return {
      nonVegCount: 0,
      vegCount: 0,
      totalCount: 0
    };
  }
}

export function formatBagDisplay(nonVegCount: number, vegCount: number): string {
  if (vegCount === 0) {
    return nonVegCount.toString();
  }
  return `${nonVegCount}+${vegCount}`;
}

export function calculateNEAEndTime(startTime: Date, durationHours: number = 4): Date {
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + durationHours);
  return endTime;
}