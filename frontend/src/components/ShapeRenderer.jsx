const ShapeRenderer = ({ shapeName }) => {
  const id = Math.random().toString(36).substr(2, 6);

  const shapeData = {
    circle: {
      label: 'Circle',
      desc: 'A round 2D shape. All points equal distance from center.',
      formula: 'Area = πr² | Circumference = 2πr',
      svg: (
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <radialGradient id={`cg_${id}`} cx="38%" cy="35%">
              <stop offset="0%" stopColor="#a5b4fc"/>
              <stop offset="100%" stopColor="#4338ca"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="82" fill={`url(#cg_${id})`}/>
          <ellipse cx="72" cy="70" rx="20" ry="11" fill="rgba(255,255,255,0.35)" transform="rotate(-30 72 70)"/>
          <line x1="100" y1="100" x2="182" y2="100" stroke="white" strokeWidth="2.5" strokeDasharray="4 3"/>
          <text x="148" y="92" fontSize="11" fill="white" fontWeight="bold">r</text>
          <circle cx="100" cy="100" r="3" fill="white"/>
        </svg>
      ),
    },
    square: {
      label: 'Square',
      desc: 'A 2D shape with 4 equal sides and 4 right angles.',
      formula: 'Area = s² | Perimeter = 4s',
      svg: (
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id={`sg_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399"/>
              <stop offset="100%" stopColor="#059669"/>
            </linearGradient>
          </defs>
          <rect x="22" y="22" width="156" height="156" rx="6" fill={`url(#sg_${id})`}/>
          <rect x="22" y="22" width="50" height="50" rx="4" fill="rgba(255,255,255,0.2)"/>
          <text x="22" y="195" fontSize="11" fill="#059669" fontWeight="bold">s</text>
          <line x1="22" y1="188" x2="178" y2="188" stroke="#059669" strokeWidth="2"/>
          <line x1="22" y1="185" x2="22" y2="191" stroke="#059669" strokeWidth="2"/>
          <line x1="178" y1="185" x2="178" y2="191" stroke="#059669" strokeWidth="2"/>
        </svg>
      ),
    },
    triangle: {
      label: 'Triangle',
      desc: 'A 2D shape with 3 sides and 3 angles that sum to 180°.',
      formula: 'Area = ½ × base × height',
      svg: (
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id={`tg_${id}`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#fb923c"/>
              <stop offset="100%" stopColor="#c2410c"/>
            </linearGradient>
          </defs>
          <polygon points="100,18 184,176 16,176" fill={`url(#tg_${id})`}/>
          <line x1="100" y1="18" x2="100" y2="176" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeDasharray="5 3"/>
          <text x="104" y="110" fontSize="11" fill="white" fontWeight="bold">h</text>
          <text x="95" y="192" fontSize="11" fill="#c2410c" fontWeight="bold">base</text>
        </svg>
      ),
    },
    rectangle: {
      label: 'Rectangle',
      desc: 'A 2D shape with 4 sides where opposite sides are equal.',
      formula: 'Area = l × w | Perimeter = 2(l + w)',
      svg: (
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id={`rg_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa"/>
              <stop offset="100%" stopColor="#1d4ed8"/>
            </linearGradient>
          </defs>
          <rect x="14" y="58" width="172" height="96" rx="6" fill={`url(#rg_${id})`}/>
          <rect x="14" y="58" width="60" height="40" rx="4" fill="rgba(255,255,255,0.2)"/>
          <text x="96" y="192" fontSize="11" fill="#1d4ed8" fontWeight="bold">length (l)</text>
        </svg>
      ),
    },
    pentagon: {
      label: 'Pentagon',
      desc: 'A 2D polygon with 5 sides and 5 angles.',
      formula: 'Interior angles sum = 540°',
      svg: (
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id={`pg_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6"/>
              <stop offset="100%" stopColor="#be185d"/>
            </linearGradient>
          </defs>
          <polygon points="100,18 182,74 152,164 48,164 18,74" fill={`url(#pg_${id})`}/>
          <circle cx="100" cy="100" r="3" fill="white"/>
        </svg>
      ),
    },
    hexagon: {
      label: 'Hexagon',
      desc: 'A 2D polygon with 6 sides and 6 angles.',
      formula: 'Interior angles sum = 720°',
      svg: (
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id={`hg_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa"/>
              <stop offset="100%" stopColor="#6d28d9"/>
            </linearGradient>
          </defs>
          <polygon points="100,16 176,58 176,142 100,184 24,142 24,58" fill={`url(#hg_${id})`}/>
          <polygon points="100,16 130,32 130,68 100,84 70,68 70,32" fill="rgba(255,255,255,0.15)"/>
        </svg>
      ),
    },
    cube: {
      label: 'Cube (3D)',
      desc: 'A 3D solid with 6 square faces, 12 edges, and 8 vertices.',
      formula: 'Volume = s³ | Surface Area = 6s²',
      svg: (
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Top face */}
          <polygon points="100,24 178,64 100,104 22,64" fill="#818cf8"/>
          {/* Left face */}
          <polygon points="22,64 100,104 100,176 22,136" fill="#3730a3"/>
          {/* Right face */}
          <polygon points="178,64 100,104 100,176 178,136" fill="#6366f1"/>
          {/* Top highlight */}
          <polygon points="100,24 140,44 100,64 60,44" fill="rgba(255,255,255,0.25)"/>
          {/* Edge lines */}
          <line x1="100" y1="24" x2="100" y2="104" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
          <line x1="22" y1="64" x2="100" y2="104" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
          <line x1="178" y1="64" x2="100" y2="104" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
        </svg>
      ),
    },
    sphere: {
      label: 'Sphere (3D)',
      desc: 'A perfectly round 3D object. All surface points equal distance from center.',
      formula: 'Volume = (4/3)πr³ | Surface Area = 4πr²',
      svg: (
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <radialGradient id={`sp_${id}`} cx="38%" cy="34%">
              <stop offset="0%" stopColor="#93c5fd"/>
              <stop offset="45%" stopColor="#3b82f6"/>
              <stop offset="100%" stopColor="#1e3a8a"/>
            </radialGradient>
          </defs>
          <ellipse cx="105" cy="176" rx="58" ry="12" fill="rgba(99,102,241,0.2)"/>
          <circle cx="100" cy="95" r="78" fill={`url(#sp_${id})`}/>
          <ellipse cx="74" cy="66" rx="24" ry="14" fill="rgba(255,255,255,0.4)" transform="rotate(-30 74 66)"/>
          <ellipse cx="100" cy="95" rx="78" ry="22" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
          <ellipse cx="100" cy="95" rx="35" ry="78" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
          <line x1="100" y1="95" x2="178" y2="95" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="4 3"/>
          <text x="143" y="88" fontSize="11" fill="white" fontWeight="bold">r</text>
          <circle cx="100" cy="95" r="3" fill="white"/>
        </svg>
      ),
    },
    pyramid: {
      label: 'Pyramid (3D)',
      desc: 'A 3D solid with a polygonal base and triangular faces meeting at an apex.',
      formula: 'Volume = (1/3) × base area × height',
      svg: (
        <svg viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Left face */}
          <polygon points="100,24 28,158 100,158" fill="#f97316"/>
          {/* Right face */}
          <polygon points="100,24 172,158 100,158" fill="#ea580c"/>
          {/* Front face */}
          <polygon points="100,24 28,158 172,158" fill="#fb923c"/>
          {/* Base ellipse */}
          <ellipse cx="100" cy="158" rx="72" ry="18" fill="#c2410c"/>
          {/* Height line */}
          <line x1="100" y1="24" x2="100" y2="158" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="5 3"/>
          <text x="106" y="98" fontSize="11" fill="white" fontWeight="bold">h</text>
        </svg>
      ),
    },
    cylinder: {
      label: 'Cylinder (3D)',
      desc: 'A 3D solid with two circular bases connected by a curved surface.',
      formula: 'Volume = πr²h | Surface Area = 2πr(r + h)',
      svg: (
        <svg viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Bottom ellipse */}
          <ellipse cx="100" cy="162" rx="66" ry="22" fill="#059669"/>
          {/* Body */}
          <rect x="34" y="46" width="132" height="116" fill="#10b981"/>
          {/* Top ellipse */}
          <ellipse cx="100" cy="46" rx="66" ry="22" fill="#34d399"/>
          {/* Highlight on top */}
          <ellipse cx="78" cy="42" rx="26" ry="9" fill="rgba(255,255,255,0.3)"/>
          {/* Height line */}
          <line x1="178" y1="46" x2="178" y2="162" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="4 3"/>
          <text x="182" y="110" fontSize="11" fill="white" fontWeight="bold">h</text>
          {/* Radius line */}
          <line x1="100" y1="46" x2="166" y2="46" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeDasharray="4 3"/>
          <text x="126" y="40" fontSize="11" fill="white" fontWeight="bold">r</text>
        </svg>
      ),
    },
    cone: {
      label: 'Cone (3D)',
      desc: 'A 3D solid with a circular base tapering to a point (apex).',
      formula: 'Volume = (1/3)πr²h | Surface Area = πr(r + l)',
      svg: (
        <svg viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Base ellipse */}
          <ellipse cx="100" cy="168" rx="72" ry="24" fill="#7c3aed"/>
          {/* Left face */}
          <polygon points="100,24 28,168 100,168" fill="#6d28d9"/>
          {/* Right face */}
          <polygon points="100,24 172,168 100,168" fill="#8b5cf6"/>
          {/* Highlight */}
          <polygon points="100,24 118,100 100,100" fill="rgba(255,255,255,0.2)"/>
          {/* Height line */}
          <line x1="100" y1="24" x2="100" y2="168" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="5 3"/>
          <text x="106" y="100" fontSize="11" fill="white" fontWeight="bold">h</text>
          {/* Radius line on base */}
          <line x1="100" y1="168" x2="172" y2="168" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeDasharray="4 3"/>
          <text x="130" y="182" fontSize="11" fill="white" fontWeight="bold">r</text>
        </svg>
      ),
    },
  };

  const shape = shapeData[shapeName?.toLowerCase()];
  if (!shape) return null;

  const is3D = ['cube', 'sphere', 'pyramid', 'cylinder', 'cone'].includes(shapeName?.toLowerCase());

  return (
    <div className="mt-4 rounded-2xl border-2 border-indigo-100 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%)' }}>
      <div className="px-4 pt-3 pb-1 flex items-center gap-2">
        <span className="text-xs font-black text-indigo-700 uppercase tracking-wide">
          {is3D ? '🎲 3D Shape' : '📐 2D Shape'} — {shape.label}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 p-4">
        <div className="w-44 h-44 flex-shrink-0">
          {shape.svg}
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-700 font-medium leading-relaxed mb-3">{shape.desc}</p>
          <div className="bg-white rounded-xl border border-indigo-100 px-3 py-2">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-wide">Formula: </span>
            <span className="text-xs font-bold text-slate-700 font-mono">{shape.formula}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const detectShape = (text) => {
  const patterns = {
    cone:      /\bcone\b/i,
    cylinder:  /\bcylinder\b/i,
    sphere:    /\bsphere\b|\b3d\s*ball\b|\bball\b.*\b3d\b/i,
    cube:      /\bcube\b|\b3d\s*square\b|\b3d\s*box\b/i,
    pyramid:   /\bpyramid\b/i,
    hexagon:   /\bhexagon\b/i,
    pentagon:  /\bpentagon\b/i,
    rectangle: /\brectangle\b/i,
    triangle:  /\btriangle\b/i,
    square:    /\bsquare\b/i,
    circle:    /\bcircle\b|\bcircular\b/i,
  };
  for (const [shape, regex] of Object.entries(patterns)) {
    if (regex.test(text)) return shape;
  }
  return null;
};

export default ShapeRenderer;
