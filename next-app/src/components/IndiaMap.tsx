"use client";

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface IndiaMapProps {
  constituencyData: any[];
  colorMode?: 'execution' | 'budget' | 'density';
  onStateSelect?: (stateName: string) => void;
  selectedState?: string | null;
}

// Map state names to recognizable realistic paths (simplified for file size but topologically correct)
// ViewBox: 0 0 600 700
const statePaths: Record<string, string> = {
  "Andhra Pradesh": "M231,482 L260,455 L285,463 L300,440 L318,460 L335,465 L328,500 L280,510 L250,540 L235,510 Z",
  "Arunachal Pradesh": "M500,240 L530,230 L550,250 L560,280 L520,290 L490,270 Z",
  "Assam": "M470,285 L500,265 L530,285 L510,305 L475,300 Z",
  "Bihar": "M370,280 L400,275 L415,295 L405,320 L370,310 L355,295 Z",
  "Chhattisgarh": "M285,350 L310,345 L320,380 L315,410 L290,440 L275,410 Z",
  "Goa": "M160,515 L170,512 L175,525 L162,530 Z",
  "Gujarat": "M80,330 L110,310 L140,320 L150,350 L130,370 L140,400 L95,385 L85,360 Z",
  "Haryana": "M200,185 L225,180 L235,210 L210,225 L190,205 Z",
  "Himachal Pradesh": "M210,135 L235,120 L255,140 L240,165 L215,160 Z",
  "Jharkhand": "M360,320 L400,315 L405,340 L380,360 L355,345 Z",
  "Karnataka": "M170,455 L220,445 L245,475 L230,520 L185,550 L165,510 Z",
  "Kerala": "M185,560 L215,580 L205,630 L180,610 Z",
  "Madhya Pradesh": "M195,300 L245,280 L300,305 L305,340 L275,365 L220,355 L180,330 Z",
  "Maharashtra": "M145,395 L210,365 L275,375 L285,410 L260,445 L220,440 L165,465 Z",
  "Manipur": "M530,310 L545,300 L550,330 L535,340 Z",
  "Meghalaya": "M470,305 L500,295 L505,315 L475,315 Z",
  "Mizoram": "M520,340 L535,335 L540,375 L525,370 Z",
  "Nagaland": "M535,285 L555,275 L560,300 L540,310 Z",
  "Odisha": "M335,370 L370,360 L395,375 L380,410 L345,435 L330,400 Z",
  "Punjab": "M175,155 L210,145 L220,175 L195,190 L170,180 Z",
  "Rajasthan": "M115,280 L140,240 L195,235 L220,270 L195,310 L145,320 L105,300 Z",
  "Sikkim": "M420,245 L435,240 L440,265 L425,270 Z",
  "Tamil Nadu": "M215,540 L250,510 L270,525 L255,570 L215,620 L205,580 Z",
  "Telangana": "M240,405 L280,395 L310,430 L285,455 L250,450 L230,430 Z",
  "Tripura": "M505,340 L520,335 L525,355 L510,360 Z",
  "Uttar Pradesh": "M250,225 L300,215 L355,245 L365,285 L320,300 L270,275 Z",
  "Uttarakhand": "M250,165 L280,160 L295,190 L260,210 L245,190 Z",
  "West Bengal": "M395,335 L425,330 L430,370 L410,405 L395,380 Z",
  "Jammu & Kashmir": "M160,100 L190,85 L225,105 L210,130 L175,120 Z",
  "Ladakh": "M215,85 L260,70 L290,105 L270,135 L225,120 Z",
};

// Delhi is a circle
const delhiCoords = { cx: 235, cy: 215, r: 4 };

interface TooltipData {
  state: string;
  count: number;
  execution?: number;
  impact?: number;
  x: number;
  y: number;
}

export default function IndiaMap({
  constituencyData,
  colorMode = 'execution',
  onStateSelect,
  selectedState,
}: IndiaMapProps) {
  const router = useRouter();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const stateStats = useMemo(() => {
    const stats: Record<string, { count: number; execSum: number; impSum: number; ids: string[] }> = {};
    constituencyData?.forEach(c => {
      const state = c.state;
      if (!stats[state]) stats[state] = { count: 0, execSum: 0, impSum: 0, ids: [] };
      stats[state].count += 1;
      stats[state].execSum += c.executionScore || 0;
      stats[state].impSum += c.workImpactScore || 0;
      stats[state].ids.push(c.id);
    });
    return stats;
  }, [constituencyData]);

  const getColor = (stateName: string) => {
    const stats = stateStats[stateName];
    if (!stats || stats.count === 0) return 'hsl(215, 20%, 92%)';

    if (colorMode === 'density') {
      const count = stats.count;
      if (count >= 3) return '#312e81'; // deep indigo
      if (count === 2) return '#3b82f6'; // medium blue
      if (count === 1) return '#93c5fd'; // light blue
      return 'hsl(215, 20%, 92%)';
    }

    // Gradient scale for execution/budget
    const value = colorMode === 'execution' 
      ? (stats.execSum / stats.count)
      : (stats.execSum / stats.count); // Mock budget logic to use execution score

    if (value >= 65) return 'hsl(160, 70%, 38%)';
    if (value >= 50) return 'hsl(38, 92%, 50%)';
    return 'hsl(0, 72%, 56%)';
  };

  const handleMouseMove = (e: React.MouseEvent, stateName: string) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Tooltip viewport clamping
    if (tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      if (x + tooltipRect.width > rect.width) {
        x -= tooltipRect.width + 10;
      } else {
        x += 10;
      }
      if (y + tooltipRect.height > rect.height) {
        y -= tooltipRect.height + 10;
      } else {
        y += 10;
      }
    } else {
      x += 10;
      y += 10;
    }

    const stats = stateStats[stateName];
    setTooltip({
      state: stateName,
      count: stats?.count || 0,
      execution: stats ? stats.execSum / stats.count : undefined,
      impact: stats ? stats.impSum / stats.count : undefined,
      x,
      y,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const handleClick = (stateName: string) => {
    const stats = stateStats[stateName];
    if (!stats || stats.count === 0) return;

    if (stats.count === 1) {
      router.push(`/constituency/${stats.ids[0]}`);
    } else if (onStateSelect) {
      onStateSelect(stateName);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[600px] aspect-[6/7] mx-auto">
      <svg 
        viewBox="0 0 600 700" 
        className="w-full h-full drop-shadow-lg"
        style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}
      >
        {Object.entries(statePaths).map(([name, d]) => {
          const isSelected = selectedState === name;
          return (
            <path
              key={name}
              d={d}
              fill={getColor(name)}
              stroke={isSelected ? '#3b82f6' : '#ffffff'}
              strokeWidth={isSelected ? 3 : 1}
              style={{
                transition: 'fill 0.3s ease, stroke 0.3s ease',
                opacity: isSelected ? 1 : 0.9,
                cursor: stateStats[name]?.count ? 'pointer' : 'default',
              }}
              onMouseMove={(e) => handleMouseMove(e, name)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(name)}
            >
              <title>{name}</title>
            </path>
          );
        })}
        {/* Delhi */}
        <circle
          cx={delhiCoords.cx}
          cy={delhiCoords.cy}
          r={delhiCoords.r}
          fill={getColor('Delhi')}
          stroke={selectedState === 'Delhi' ? '#3b82f6' : '#ffffff'}
          strokeWidth={selectedState === 'Delhi' ? 2 : 1}
          style={{
            transition: 'fill 0.3s ease, stroke 0.3s ease',
            cursor: stateStats['Delhi']?.count ? 'pointer' : 'default',
          }}
          onMouseMove={(e) => handleMouseMove(e, 'Delhi')}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick('Delhi')}
        >
          <title>Delhi</title>
        </circle>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          ref={tooltipRef}
          className="absolute z-10 p-3 bg-gray-900 text-white rounded-lg shadow-xl text-sm pointer-events-none min-w-[150px]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="font-bold text-yellow-400 mb-1">{tooltip.state}</div>
          <div className="text-gray-300">Constituencies: {tooltip.count}</div>
          {tooltip.count > 0 && (
            <>
              {tooltip.execution !== undefined && (
                <div className="text-gray-300">Execution: {tooltip.execution.toFixed(1)}%</div>
              )}
              {tooltip.impact !== undefined && (
                <div className="text-gray-300">Impact: {tooltip.impact.toFixed(1)}/10</div>
              )}
              <div className="mt-2 text-xs text-blue-300 italic">
                {tooltip.count === 1 ? 'Click to view' : 'Click to explore'}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
