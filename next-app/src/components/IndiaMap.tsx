'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface StateData {
  name: string;
  constituencies: {
    id: string;
    name: string;
    representative: string;
    party: string;
    score: number;
  }[];
}

interface IndiaMapProps {
  constituencyData: any[];
}

export default function IndiaMap({ constituencyData }: IndiaMapProps) {
  const router = useRouter();
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Map constituency data to states
  const statesMap = React.useMemo(() => {
    const map: Record<string, StateData> = {};

    constituencyData.forEach((c) => {
      // Normalize state name to match SVG IDs
      const stateName = c.state;
      if (!map[stateName]) {
        map[stateName] = {
          name: stateName,
          constituencies: [],
        };
      }
      map[stateName].constituencies.push({
        id: c.id,
        name: c.name,
        representative: c.representative,
        party: c.party,
        score: c.metrics.promise_vs_execution.score_pct,
      });
    });

    return map;
  }, [constituencyData]);

  // Determine state color based on average constituency score
  const getStateColorClass = (stateName: string) => {
    const data = statesMap[stateName];
    if (!data || data.constituencies.length === 0) return 'map-color-none';

    const avgScore =
      data.constituencies.reduce((acc, curr) => acc + curr.score, 0) /
      data.constituencies.length;

    if (avgScore >= 65) return 'map-color-high';
    if (avgScore >= 50) return 'map-color-medium';
    return 'map-color-low';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - bounds.left + 15,
      y: e.clientY - bounds.top + 15,
    });
  };

  const handleStateClick = (stateName: string) => {
    const data = statesMap[stateName];
    if (data && data.constituencies.length > 0) {
      if (data.constituencies.length === 1) {
        router.push(`/constituency/${data.constituencies[0].id}`);
      } else {
        // Search for that state on the homepage
        router.push(`/?q=${encodeURIComponent(stateName)}`);
      }
    }
  };

  // Simplified paths for states of India (scaled within a 600x680 viewport)
  // These are clean, premium geometric representations designed to render reliably.
  const statePaths = [
    {
      id: 'Jammu & Kashmir',
      name: 'Jammu & Kashmir & Ladakh',
      d: 'M 220,50 L 250,40 L 290,50 L 300,75 L 290,110 L 250,115 L 210,105 L 205,80 Z',
    },
    {
      id: 'Himachal Pradesh',
      name: 'Himachal Pradesh',
      d: 'M 250,115 L 290,110 L 310,120 L 305,145 L 285,150 L 265,140 Z',
    },
    {
      id: 'Punjab',
      name: 'Punjab',
      d: 'M 210,105 L 250,115 L 265,140 L 250,165 L 215,160 L 200,135 Z',
    },
    {
      id: 'Uttarakhand',
      name: 'Uttarakhand',
      d: 'M 285,150 L 305,145 L 340,160 L 345,185 L 320,200 L 295,185 Z',
    },
    {
      id: 'Haryana',
      name: 'Haryana',
      d: 'M 250,165 L 285,150 L 295,185 L 280,205 L 245,200 L 240,175 Z',
    },
    {
      id: 'Delhi',
      name: 'Delhi',
      d: 'M 280,190 A 8,8 0 1,1 280,206 A 8,8 0 1,1 280,190 Z',
    },
    {
      id: 'Rajasthan',
      name: 'Rajasthan',
      d: 'M 140,180 L 215,160 L 245,200 L 280,205 L 260,250 L 250,290 L 195,295 L 145,250 Z',
    },
    {
      id: 'Gujarat',
      name: 'Gujarat',
      d: 'M 115,260 L 145,250 L 195,295 L 200,325 L 175,360 L 155,360 L 140,325 L 115,310 L 95,305 Z',
    },
    {
      id: 'Madhya Pradesh',
      name: 'Madhya Pradesh',
      d: 'M 195,295 L 250,290 L 300,265 L 360,270 L 375,320 L 380,365 L 325,385 L 250,380 L 200,325 Z',
    },
    {
      id: 'Uttar Pradesh',
      name: 'Uttar Pradesh',
      d: 'M 280,205 L 295,185 L 320,200 L 345,185 L 435,225 L 440,255 L 360,270 L 300,265 Z',
    },
    {
      id: 'Bihar',
      name: 'Bihar',
      d: 'M 435,225 L 490,230 L 515,265 L 470,290 L 440,285 L 440,255 Z',
    },
    {
      id: 'Jharkhand',
      name: 'Jharkhand',
      d: 'M 440,285 L 470,290 L 495,295 L 500,335 L 450,340 L 430,315 Z',
    },
    {
      id: 'West Bengal',
      name: 'West Bengal',
      d: 'M 490,230 L 500,200 L 515,210 L 505,250 L 530,280 L 525,325 L 510,360 L 495,340 L 500,335 L 495,295 L 515,265 Z',
    },
    {
      id: 'Odisha',
      name: 'Odisha',
      d: 'M 430,315 L 450,340 L 495,340 L 485,395 L 455,420 L 415,385 L 410,345 Z',
    },
    {
      id: 'Chhattisgarh',
      name: 'Chhattisgarh',
      d: 'M 375,320 L 430,315 L 410,345 L 415,385 L 405,435 L 375,410 L 380,365 Z',
    },
    {
      id: 'Maharashtra',
      name: 'Maharashtra',
      d: 'M 175,360 L 250,380 L 325,385 L 380,365 L 375,410 L 330,460 L 265,475 L 210,470 L 195,445 L 180,415 Z',
    },
    {
      id: 'Goa',
      name: 'Goa',
      d: 'M 205,480 A 6,6 0 1,1 205,492 A 6,6 0 1,1 205,480 Z',
    },
    {
      id: 'Karnataka',
      name: 'Karnataka',
      d: 'M 210,470 L 265,475 L 290,515 L 290,565 L 270,595 L 240,580 L 220,535 L 205,492 Z',
    },
    {
      id: 'Andhra Pradesh',
      name: 'Andhra Pradesh',
      d: 'M 290,515 L 330,460 L 375,410 L 405,435 L 375,480 L 345,545 L 320,585 L 290,565 Z',
    },
    {
      id: 'Telangana',
      name: 'Telangana',
      d: 'M 265,475 L 330,460 L 375,480 L 345,545 L 290,515 Z',
    },
    {
      id: 'Tamil Nadu',
      name: 'Tamil Nadu',
      d: 'M 270,595 L 290,565 L 320,585 L 325,620 L 305,665 L 275,655 Z',
    },
    {
      id: 'Kerala',
      name: 'Kerala',
      d: 'M 240,580 L 270,595 L 275,655 L 255,650 L 245,610 Z',
    },
  ];

  return (
    <div className="map-container select-none">
      <svg
        viewBox="0 0 600 680"
        className="map-svg"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredState(null)}
      >
        {statePaths.map((path) => {
          const stateData = statesMap[path.id];
          const hasData = stateData && stateData.constituencies.length > 0;
          return (
            <path
              key={path.id}
              d={path.d}
              className={`map-state ${getStateColorClass(path.id)}`}
              onClick={() => handleStateClick(path.id)}
              onMouseEnter={() => {
                if (hasData) {
                  setHoveredState(stateData);
                } else {
                  setHoveredState({ name: path.name, constituencies: [] });
                }
              }}
              style={{
                strokeWidth: hasData ? 2 : 1,
                cursor: hasData ? 'pointer' : 'default',
              }}
            />
          );
        })}
      </svg>

      {/* Dynamic Hover Tooltip */}
      {hoveredState && (
        <div
          className="map-tooltip"
          style={{
            display: 'block',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
        >
          <div className="font-bold border-b border-slate-700 pb-1 mb-1 text-yellow-400">
            {hoveredState.name}
          </div>
          {hoveredState.constituencies.length === 0 ? (
            <div className="text-xs text-slate-400 italic">No constituencies tracked</div>
          ) : (
            <div className="space-y-2 mt-1">
              {hoveredState.constituencies.map((c) => (
                <div key={c.id} className="text-xs">
                  <span className="font-semibold">{c.name}</span>: {c.representative}{' '}
                  <span className="text-slate-400">({c.party})</span>
                  <div className="font-bold text-emerald-400 mt-0.5">
                    Execution Score: {c.score}%
                  </div>
                </div>
              ))}
              <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1 mt-1 text-center font-bold">
                Click to explore details
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
