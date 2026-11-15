export type Die = 1 | 2 | 3 | 4 | 5 | 6;
export type Dice = [Die, Die, Die, Die, Die];

/** 1 = keep this die, 0 = reroll it. Same index order as `Dice`. */
export type KeepMask = [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1];
