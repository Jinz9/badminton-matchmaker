import React from "react";
import Svg, { Path, Circle, Rect, Line } from "react-native-svg";

export interface IconProps {
  /** Kích thước icon (px) */
  size?: number;
  /** Màu nét vẽ */
  color?: string;
}

export const BackIcon: React.FC<IconProps> = ({ size = 20, color = "#DAE2FD" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BellIcon: React.FC<IconProps> = ({ size = 20, color = "#DAE2FD" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21a2 2 0 0 1-3.46 0"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 16, color = "#0B1326" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SwapIcon: React.FC<IconProps> = ({ size = 20, color = "#DAE2FD" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L13 16M17 20L21 16"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const UndoIcon: React.FC<IconProps> = ({ size = 18, color = "#DAE2FD" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 14L4 9L9 4"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 9H14.5C17.8 9 20 11.2 20 14.5C20 17.8 17.8 20 14.5 20H11"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 20, color = "#DAE2FD" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
  </Svg>
);

export const AlertIcon: React.FC<IconProps> = ({ size = 20, color = "#FFB783" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
    <Line x1={12} y1={8} x2={12} y2={13} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    <Circle cx={12} cy={16.5} r={1.2} fill={color} />
  </Svg>
);

export const ShuttleIcon: React.FC<IconProps> = ({ size = 20, color = "#A3E636" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 18C13.66 18 15 19.34 15 21H9C9 19.34 10.34 18 12 18Z"
      fill={color}
    />
    <Path
      d="M7 4L9.5 16H14.5L17 4L14 6L12 3L10 6L7 4Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </Svg>
);

export const CourtNavIcon: React.FC<IconProps> = ({ size = 20, color = "#DAE2FD" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={5} width={18} height={14} rx={2} stroke={color} strokeWidth={2} />
    <Line x1={12} y1={5} x2={12} y2={19} stroke={color} strokeWidth={2} />
    <Line x1={3} y1={12} x2={21} y2={12} stroke={color} strokeWidth={1.4} />
  </Svg>
);

export const UsersIcon: React.FC<IconProps> = ({ size = 20, color = "#DAE2FD" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={9} cy={8} r={3.5} stroke={color} strokeWidth={2} />
    <Path
      d="M3 19C3 16.2 5.7 14 9 14C12.3 14 15 16.2 15 19"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Circle cx={16.5} cy={9} r={2.5} stroke={color} strokeWidth={1.8} />
    <Path
      d="M16.5 14.5C19 14.5 21 16.3 21 18.8"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export const UserIcon: React.FC<IconProps> = ({ size = 20, color = "#DAE2FD" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={2} />
    <Path
      d="M5 20C5 16.7 8.1 14 12 14C15.9 14 19 16.7 19 20"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export const ChartIcon: React.FC<IconProps> = ({ size = 20, color = "#DAE2FD" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={4} y={13} width={4} height={7} rx={1} stroke={color} strokeWidth={2} />
    <Rect x={10} y={8} width={4} height={12} rx={1} stroke={color} strokeWidth={2} />
    <Rect x={16} y={4} width={4} height={16} rx={1} stroke={color} strokeWidth={2} />
  </Svg>
);

