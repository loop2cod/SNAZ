export interface ParsedBagFormat {
    nonVegCount: number;
    vegCount: number;
    totalCount: number;
}
export declare function parseBagFormat(bagFormat: string): ParsedBagFormat;
export declare function formatBagDisplay(nonVegCount: number, vegCount: number): string;
export declare function calculateNEAEndTime(startTime: Date, durationHours?: number): Date;
