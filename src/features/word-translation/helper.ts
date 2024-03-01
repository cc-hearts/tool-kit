export enum TRANSITION_TYPE {
    KEBAB = 'kebab',
    SNAKE = 'snake',
    PASCAL = 'pascal',
    UPPER = 'upper',
    LOWER = 'lower',
    ENUM = 'enum',
    CAMEL = 'camel'
}

export interface TransitionProps {
    text: string
    type: TRANSITION_TYPE
}
