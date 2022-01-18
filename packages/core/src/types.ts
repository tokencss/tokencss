export interface Token {
    value: string|number|boolean|(string|number|boolean)[];
    type: string;
    description?: string;
    extensions?: Record<string, any>;
    // Extension
    $path?: string;
    // Extension
    $scale?: string;
}

export type Scale = 'color' |
    'shadow' |
    'space' |
    'size' |
    'width' |
    'height' |
    'radius' |
    'font' |
    'font-size' |
    'font-weight' |
    'font-leading' |
    'font-tracking' |
    'easing' | 
    'media' |
    'unknown';
