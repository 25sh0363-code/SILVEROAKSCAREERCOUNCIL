/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string; // Sizing class
}

/**
 * Premium, high-fidelity SVG-rendered official Silver Oaks logo
 * Perfectly replicates the red background, elegant white high-contrast serif typography,
 * large 'S', and the iconic green frond.
 */
export default function Logo({ className = 'h-10' }: LogoProps) {
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        className="h-full w-auto"
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Solid brand red background block */}
        <rect width="500" height="500" rx="36" fill="#C21B23" />
        
        {/* 'SILVER' - serif uppercase, with larger S */}
        <text
          x="15"
          y="294"
          fill="#FFFFFF"
          fontFamily="'Times New Roman', Times, 'Georgia', serif"
          fontSize="92"
          fontWeight="tight"
          letterSpacing="1"
        >
          S
        </text>
        <text
          x="78"
          y="290"
          fill="#FFFFFF"
          fontFamily="'Times New Roman', Times, 'Georgia', serif"
          fontSize="68"
          fontWeight="light"
          letterSpacing="4"
        >
          ILVER
        </text>

        {/* 'OAKS' - nested below, classic serif uppercase */}
        <text
          x="125"
          y="358"
          fill="#FFFFFF"
          fontFamily="'Times New Roman', Times, 'Georgia', serif"
          fontSize="68"
          fontWeight="normal"
          letterSpacing="6"
        >
          OAKS
        </text>

        {/* Large 'S' capital brand character on the right */}
        <text
          x="305"
          y="358"
          fill="#FFFFFF"
          fontFamily="'Times New Roman', Times, 'Georgia', serif"
          fontSize="170"
          fontWeight="normal"
        >
          S
        </text>

        {/* Dynamic hand-drawn Green Leafy Branch Frond (interlaced with S) */}
        {/* Stem of the branch */}
        <path
          d="M 315 260 Q 305 240 330 210 T 400 150 T 485 120"
          stroke="#00A651"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Green Leaflets along the stem pointing upwards */}
        {/* Leaflet 1 */}
        <path
          d="M 305 235 C 290 190 320 160 338 180 C 325 210 315 225 305 235 Z"
          fill="#22C55E"
          stroke="#15803D"
          strokeWidth="1"
        />
        {/* Leaflet 2 */}
        <path
          d="M 322 205 C 300 165 330 135 352 155 C 340 185 332 195 322 205 Z"
          fill="#10B981"
          stroke="#047857"
          strokeWidth="1"
        />
        {/* Leaflet 3 */}
        <path
          d="M 348 185 C 325 145 355 115 375 135 C 365 165 358 175 348 185 Z"
          fill="#22C55E"
          stroke="#15803D"
          strokeWidth="1"
        />
        {/* Leaflet 4 */}
        <path
          d="M 375 165 C 355 125 385 95 405 115 C 392 145 385 155 375 165 Z"
          fill="#10B981"
          stroke="#047857"
          strokeWidth="1"
        />
        {/* Leaflet 5 */}
        <path
          d="M 402 148 C 382 108 412 78 432 98 C 419 128 412 138 402 148 Z"
          fill="#22C55E"
          stroke="#15803D"
          strokeWidth="1"
        />
        {/* Leaflet 6 */}
        <path
          d="M 432 132 C 412 92 442 62 462 82 C 449 112 442 122 432 132 Z"
          fill="#10B981"
          stroke="#047857"
          strokeWidth="1"
        />
        {/* Leaflet 7 */}
        <path
          d="M 462 120 C 445 80 472 50 490 70 C 478 100 472 110 462 120 Z"
          fill="#22C55E"
          stroke="#15803D"
          strokeWidth="1"
        />

        {/* Lower Leaves on the other side of the stem */}
        {/* Leaflet 8 */}
        <path
          d="M 322 225 C 342 205 322 175 312 185 C 315 205 318 215 322 225 Z"
          fill="#15803D"
        />
        {/* Leaflet 9 */}
        <path
          d="M 345 198 C 368 180 348 150 338 160 C 340 180 342 190 345 198 Z"
          fill="#16A34A"
        />
        {/* Leaflet 10 */}
        <path
          d="M 372 178 C 395 160 375 130 365 140 C 367 160 369 170 372 178 Z"
          fill="#15803D"
        />
        {/* Leaflet 11 */}
        <path
          d="M 402 158 C 425 140 405 110 395 120 C 397 140 399 150 402 158 Z"
          fill="#16A34A"
        />
        {/* Leaflet 12 */}
        <path
          d="M 432 138 C 455 120 435 90 425 100 C 427 120 429 130 432 138 Z"
          fill="#15803D"
        />
      </svg>
    </div>
  );
}
