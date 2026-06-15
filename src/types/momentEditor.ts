export type MomentStroke = {
  color: string;
  points: { x: number; y: number }[];
};

export type MomentSticker = {
  id: string;
  emoji: string;
  x: number;
  y: number;
};

export type MomentTextLabel = {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
};
