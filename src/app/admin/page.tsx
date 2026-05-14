/* eslint-disable react/jsx-key, react/no-unescaped-entities, react-hooks/exhaustive-deps, @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ─── SVG Icons ────────────────────────────────────────────────
const FishIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 12c.94-3.46 4.94-6 10.5-6-3.46 4.94-6 8.94-9.46 9.88A5 5 0 0 1 6.5 12Z"/>
    <path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/>
    <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33"/>
    <path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4"/>
    <path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H8c1.55-1.5 2.39-3.5 2.26-5"/>
  </svg>
);
const MapIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
);
const StatsIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const FilterIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const PlusIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const EditIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const UploadIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const XIcon = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const CheckIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const PinIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const WaterIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.5 11 4 15 4 17a8 8 0 0 0 16 0c0-2-2.5-6-8-15z"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const SaveIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const SunIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

// ─── Coord mode buttons — винесено щоб уникнути JSX в масиві ──
const COORD_MODES = [
  { id: 'manual', label: 'Вручну',   icon: <PinIcon /> },
  { id: 'map',    label: 'На карті', icon: <MapIcon /> },
];

// ─── Toast ────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3800); return () => clearTimeout(t); }, [onClose]);
  const cfg = {
    success: { bg: '#f0fdf4', border: '#bbf7d0', accent: '#059669', icon: <CheckIcon /> },
    error:   { bg: '#fef2f2', border: '#fecaca', accent: '#dc2626', icon: '!' },
    info:    { bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb', icon: 'i' },
  };
  const c = cfg[type] || cfg.info;
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, background:c.bg, border:`1px solid ${c.border}`, borderLeft:`3px solid ${c.accent}`, borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', gap:10, boxShadow:'0 6px 24px rgba(0,0,0,0.09)', animation:'toastIn 0.22s ease', maxWidth:340, fontSize:13.5, fontWeight:500, color:'#1e293b' }}>
      <span style={{ color:c.accent, display:'flex', flexShrink:0 }}>{c.icon}</span>
      <span style={{ flex:1 }}>{message}</span>
      <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:2, display:'flex' }}><XIcon /></button>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9998, background:'rgba(15,23,42,0.5)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
      <div style={{ background:'white', borderRadius:18, padding:28, maxWidth:360, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', animation:'fadeUp 0.2s ease' }}>
        <div style={{ fontSize:15, fontWeight:600, color:'#0f172a', marginBottom:20, lineHeight:1.5 }}>{message}</div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:'10px', borderRadius:10, border:'1px solid #e2e8f0', background:'white', cursor:'pointer', fontSize:14, color:'#64748b', fontWeight:500, fontFamily:'inherit' }}>Скасувати</button>
          <button onClick={onConfirm} style={{ flex:1, padding:'10px', borderRadius:10, border:'none', background:'#ef4444', cursor:'pointer', fontSize:14, color:'white', fontWeight:600, fontFamily:'inherit' }}>Видалити</button>
        </div>
      </div>
    </div>
  );
}

// ─── Leaflet map picker ────────────────────────────────────────
function MapPicker({ lat, lng, onSelect }) {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!document.querySelector('#lf-css')) {
      const l = document.createElement('link');
      l.id = 'lf-css'; l.rel = 'stylesheet';
      l.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(l);
    }
    if (window.L) { setReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!ready || !divRef.current || mapRef.current) return;
    const L = window.L;
    const iLat = lat ? parseFloat(lat) : 49.4;
    const iLng = lng ? parseFloat(lng) : 31.2;
    const map = L.map(divRef.current).setView([iLat, iLng], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);
    const mkIcon = () => L.divIcon({ className:'', html:`<div style="width:28px;height:28px;background:#2563eb;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(37,99,235,0.4)"></div>`, iconSize:[28,28], iconAnchor:[14,28] });
    if (lat && lng) markerRef.current = L.marker([parseFloat(lat), parseFloat(lng)], { icon: mkIcon() }).addTo(map);
    map.on('click', e => {
      const { lat: la, lng: ln } = e.latlng;
      if (markerRef.current) markerRef.current.setLatLng([la, ln]);
      else markerRef.current = L.marker([la, ln], { icon: mkIcon() }).addTo(map);
      onSelect(la.toFixed(6), ln.toFixed(6));
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapRef.current || !window.L || !lat || !lng) return;
    const L = window.L;
    const c = [parseFloat(lat), parseFloat(lng)];
    if (markerRef.current) markerRef.current.setLatLng(c);
    else markerRef.current = L.marker(c, { icon: L.divIcon({ className:'', html:`<div style="width:28px;height:28px;background:#2563eb;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(37,99,235,0.4)"></div>`, iconSize:[28,28], iconAnchor:[14,28] }) }).addTo(mapRef.current);
    mapRef.current.setView(c, Math.max(mapRef.current.getZoom(), 12));
  }, [lat, lng]);

  return (
    <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid #e2e8f0', position:'relative' }}>
      {!ready && <div style={{ height:280, background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', fontSize:13 }}>Завантаження карти…</div>}
      <div ref={divRef} style={{ height:280, display: ready ? 'block' : 'none' }} />
      {ready && (
        <div style={{ position:'absolute', bottom:8, left:8, zIndex:999, background:'rgba(255,255,255,0.9)', backdropFilter:'blur(6px)', color:'#64748b', fontSize:11, padding:'4px 10px', borderRadius:8, border:'1px solid #e2e8f0', fontWeight:500 }}>
          Клікніть на карті для вибору
        </div>
      )}
    </div>
  );
}

// ─── Image drop zone ───────────────────────────────────────────
function ImageZone({ files, onChange, multiple = true, label }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);
  const add = fs => {
    const imgs = Array.from(fs).filter(f => f.type.startsWith('image/'));
    onChange(multiple ? [...files, ...imgs] : [imgs[0]].filter(Boolean));
  };
  return (
    <div>
      {label && <div style={{ fontSize:12, fontWeight:600, color:'#64748b', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>}
      <div onClick={() => ref.current?.click()} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
        style={{ border:`2px dashed ${drag ? '#2563eb' : '#cbd5e1'}`, borderRadius:11, padding:'20px 16px', textAlign:'center', cursor:'pointer', background: drag ? '#eff6ff' : '#f8fafc', transition:'all 0.15s' }}>
        <div style={{ color: drag ? '#2563eb' : '#94a3b8', display:'flex', justifyContent:'center', marginBottom:5 }}><UploadIcon /></div>
        <div style={{ fontSize:13, fontWeight:500, color:'#64748b' }}>Перетягніть або клікніть</div>
        <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>JPG, PNG, WebP · до 10 MB</div>
        <input ref={ref} type="file" accept="image/*" multiple={multiple} onChange={e => add(e.target.files)} style={{ display:'none' }} />
      </div>
      {files.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:10 }}>
          {files.map((f, i) => (
            <div key={i} style={{ position:'relative' }}>
              <img src={URL.createObjectURL(f)} alt="" style={{ width:64, height:64, objectFit:'cover', borderRadius:9, border:'1px solid #e2e8f0', display:'block' }} />
              <button onClick={e => { e.stopPropagation(); const n = [...files]; n.splice(i, 1); onChange(n); }} style={{ position:'absolute', top:-5, right:-5, background:'#ef4444', border:'2px solid white', borderRadius:'50%', width:18, height:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}><XIcon /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Existing images ───────────────────────────────────────────
function ExistingImages({ images, toRemove, onToggleRemove, label }) {
  if (!images || images.length === 0) return null;
  return (
    <div>
      {label && <div style={{ fontSize:12, fontWeight:600, color:'#64748b', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
        {images.map((img, i) => {
          const removing = toRemove.includes(img.publicId);
          return (
            <div key={i} style={{ position:'relative' }}>
              <img src={img.url} alt="" style={{ width:64, height:64, objectFit:'cover', borderRadius:9, border:`2px solid ${removing ? '#ef4444' : '#e2e8f0'}`, display:'block', opacity: removing ? 0.4 : 1, transition:'all 0.15s' }} />
              <button onClick={() => onToggleRemove(img.publicId)}
                style={{ position:'absolute', top:-5, right:-5, background: removing ? '#94a3b8' : '#ef4444', border:'2px solid white', borderRadius:'50%', width:18, height:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white', transition:'all 0.15s' }}>
                {removing ? <PlusIcon /> : <XIcon />}
              </button>
              {removing && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'#ef4444', letterSpacing:'0.05em' }}>DEL</div>}
            </div>
          );
        })}
      </div>
      {toRemove.length > 0 && <div style={{ fontSize:11, color:'#ef4444', marginTop:6, fontWeight:500 }}>⚠️ {toRemove.length} фото буде видалено після збереження</div>}
    </div>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────
function Field({ label, required, children, hint }) {
  return (
    <div>
      {label && <div style={{ fontSize:12, fontWeight:600, color:'#64748b', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em' }}>
        {label}{required && <span style={{ color:'#ef4444', marginLeft:2 }}>*</span>}
      </div>}
      {children}
      {hint && <div style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>{hint}</div>}
    </div>
  );
}

const IS = { width:'100%', border:'1px solid #e2e8f0', borderRadius:10, padding:'10px 14px', fontSize:14, color:'#1e293b', background:'white', outline:'none', boxSizing:'border-box', transition:'border-color 0.15s, box-shadow 0.15s', fontFamily:'inherit' };

function Inp({ as, style: sx, ...props }) {
  const onF = e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; };
  const onB = e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };
  return as === 'textarea'
    ? <textarea {...props} onFocus={onF} onBlur={onB} style={{ ...IS, resize:'vertical', minHeight:78, ...sx }} />
    : <input {...props} onFocus={onF} onBlur={onB} style={{ ...IS, ...sx }} />;
}

// ─── Select ────────────────────────────────────────────────────
function Sel({ value, onChange, children, placeholder }) {
  return (
    <select value={value} onChange={onChange}
      style={{ ...IS, appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center', paddingRight:36, cursor:'pointer' }}>
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
}

// ─── Multi-select chip picker ──────────────────────────────────
function ChipPicker({ label, options, value, onChange, colorScheme = 'blue' }) {
  const colors = {
    blue:   { bg:'#eff6ff', border:'#bfdbfe', color:'#1d4ed8', activeBg:'#2563eb', activeColor:'white' },
    green:  { bg:'#f0fdf4', border:'#bbf7d0', color:'#065f46', activeBg:'#059669', activeColor:'white' },
    orange: { bg:'#fff7ed', border:'#fed7aa', color:'#9a3412', activeBg:'#ea580c', activeColor:'white' },
    purple: { bg:'#f5f3ff', border:'#ddd6fe', color:'#4c1d95', activeBg:'#7c3aed', activeColor:'white' },
  };
  const c = colors[colorScheme] || colors.blue;
  const toggle = v => onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  return (
    <Field label={label}>
      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
        {options.map(opt => {
          const active = value.includes(opt.value || opt);
          const val = opt.value || opt;
          const lbl = opt.label || opt;
          return (
            <button key={val} onClick={() => toggle(val)} type="button"
              style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:20, border:`1px solid ${active ? c.activeBg : c.border}`, background: active ? c.activeBg : c.bg, color: active ? c.activeColor : c.color, cursor:'pointer', fontSize:12.5, fontWeight:500, transition:'all 0.15s', fontFamily:'inherit' }}>
              {active && <CheckIcon />}
              {lbl}
            </button>
          );
        })}
        {options.length === 0 && <span style={{ fontSize:12, color:'#94a3b8' }}>Немає доступних опцій</span>}
      </div>
    </Field>
  );
}

// ─── Fish tag input ────────────────────────────────────────────
function FishTagger({ value, onChange, allFish }) {
  const [txt, setTxt] = useState('');
  const [open, setOpen] = useState(false);
  const suggestions = allFish.map(f => f.name).filter(n => n.toLowerCase().includes(txt.toLowerCase()) && !value.includes(n)).slice(0, 6);
  const add = name => { const t = name.trim(); if (t && !value.includes(t)) onChange([...value, t]); setTxt(''); setOpen(false); };
  return (
    <Field label="Риби у водоймі">
      {value.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:8 }}>
          {value.map(n => (
            <span key={n} style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#eff6ff', border:'1px solid #bfdbfe', color:'#1d4ed8', borderRadius:20, padding:'3px 10px', fontSize:12.5, fontWeight:500 }}>
              {n}
              <button onClick={() => onChange(value.filter(v => v !== n))} style={{ background:'none', border:'none', cursor:'pointer', color:'#60a5fa', padding:0, display:'flex', lineHeight:1 }}><XIcon /></button>
            </span>
          ))}
        </div>
      )}
      <div style={{ position:'relative' }}>
        <Inp value={txt} onChange={e => { setTxt(e.target.value); setOpen(true); }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (txt.trim()) add(txt); } }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} placeholder="Назва риби + Enter…" />
        {open && suggestions.length > 0 && (
          <div style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:50, background:'white', border:'1px solid #e2e8f0', borderRadius:11, marginTop:4, boxShadow:'0 6px 20px rgba(0,0,0,0.09)', overflow:'hidden' }}>
            {suggestions.map(n => (
              <button key={n} onMouseDown={() => add(n)} style={{ display:'block', width:'100%', textAlign:'left', background:'none', border:'none', cursor:'pointer', padding:'9px 14px', color:'#334155', fontSize:13.5, transition:'background 0.1s', fontFamily:'inherit' }}
                onMouseEnter={e => e.target.style.background = '#f1f5f9'} onMouseLeave={e => e.target.style.background = 'none'}
              >{n}</button>
            ))}
          </div>
        )}
      </div>
    </Field>
  );
}

// ─── Card ──────────────────────────────────────────────────────
function Card({ children, style }) {
  return <div style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:18, padding:24, boxShadow:'0 1px 4px rgba(0,0,0,0.04)', ...style }}>{children}</div>;
}

function CardHead({ icon, iconBg, iconColor, title, sub }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:22, paddingBottom:18, borderBottom:'1px solid #f1f5f9' }}>
      <div style={{ width:36, height:36, borderRadius:10, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', color:iconColor, flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ fontWeight:700, fontSize:15, color:'#0f172a' }}>{title}</div>
        {sub && <div style={{ fontSize:12, color:'#94a3b8', marginTop:1 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── List row ──────────────────────────────────────────────────
function Row({ thumb, fallback, title, sub, tags, extra, onDelete, onEdit }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ display:'flex', gap:13, alignItems:'flex-start', padding:'13px 14px', borderRadius:13, border:'1px solid', borderColor: hov ? '#dbeafe' : '#f1f5f9', background: hov ? '#f8fafc' : 'white', transition:'all 0.15s' }}>
      {thumb
        ? <img src={thumb} alt="" style={{ width:52, height:52, objectFit:'cover', borderRadius:9, flexShrink:0, border:'1px solid #e2e8f0' }} />
        : <div style={{ width:52, height:52, borderRadius:9, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#94a3b8' }}>{fallback}</div>
      }
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:14, color:'#1e293b', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{title}</div>
        {sub && <div style={{ fontSize:12, color:'#94a3b8', marginBottom: tags?.length ? 5 : 0 }}>{sub}</div>}
        {tags?.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {tags.slice(0, 4).map(t => <span key={t} style={{ background:'#eff6ff', color:'#2563eb', borderRadius:20, padding:'2px 8px', fontSize:11, fontWeight:500 }}>{t}</span>)}
            {tags.length > 4 && <span style={{ color:'#94a3b8', fontSize:11 }}>+{tags.length - 4}</span>}
          </div>
        )}
        {extra}
      </div>
      <div style={{ display:'flex', gap:6, flexShrink:0 }}>
        {onEdit && (
          <button onClick={onEdit}
            style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:8, padding:7, cursor:'pointer', color:'#64748b', display:'flex', transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
            <EditIcon />
          </button>
        )}
        <button onClick={onDelete}
          style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:8, padding:7, cursor:'pointer', color:'#94a3b8', display:'flex', transition:'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fecaca'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

// ─── Btn ───────────────────────────────────────────────────────
function Btn({ onClick, disabled, children, color = '#2563eb', shadow = 'rgba(37,99,235,0.2)', variant = 'fill', style: sx }) {
  const [hov, setHov] = useState(false);
  const fill = variant === 'fill';
  return (
    <button onClick={onClick} disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width:'100%', padding:'12px', borderRadius:11, border: fill ? 'none' : `1px solid ${color}`, cursor: disabled ? 'not-allowed' : 'pointer',
        background: disabled ? '#e2e8f0' : fill ? color : hov ? color+'18' : 'white',
        opacity: disabled ? 0.6 : hov && fill ? 0.88 : 1,
        color: disabled ? '#94a3b8' : fill ? 'white' : color, fontSize:14, fontWeight:600,
        boxShadow: disabled || !fill ? 'none' : `0 2px 10px ${shadow}`,
        display:'flex', alignItems:'center', justifyContent:'center', gap:7,
        transition:'all 0.15s', fontFamily:'inherit', ...sx }}>
      {children}
    </button>
  );
}

function SectionDivider({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, margin:'4px 0' }}>
      <div style={{ flex:1, height:1, background:'#f1f5f9' }} />
      <span style={{ fontSize:11, fontWeight:600, color:'#cbd5e1', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{label}</span>
      <div style={{ flex:1, height:1, background:'#f1f5f9' }} />
    </div>
  );
}

// ─── Season selector ──────────────────────────────────────────
const SEASON_OPTIONS = [
  { value:'spring', label:'🌱 Весна' },
  { value:'summer', label:'☀️ Літо' },
  { value:'autumn', label:'🍂 Осінь' },
  { value:'winter', label:'❄️ Зима' },
];

// ─── Coord mode selector (без JSX в масиві) ───────────────────
function CoordModeSelector({ coordMode, setCoordMode }) {
  return (
    <div style={{ display:'flex', gap:6, marginBottom:10 }}>
      {COORD_MODES.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => setCoordMode(id)}
          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 10px', borderRadius:9, border:'1px solid', borderColor: coordMode === id ? '#2563eb' : '#e2e8f0', background: coordMode === id ? '#eff6ff' : 'white', color: coordMode === id ? '#2563eb' : '#64748b', cursor:'pointer', fontSize:13, fontWeight:500, transition:'all 0.15s', fontFamily:'inherit' }}
        >
          {icon}{label}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EDIT WATER FORM
// ═══════════════════════════════════════════════════════════════
function EditWaterForm({ water, fishList, filterConfig, authH, onSaved, onCancel, showToast }) {
  const [form, setForm] = useState({
    name: water.name || '',
    description: water.description || '',
    lat: water.location?.coordinates[1]?.toString() || '',
    lng: water.location?.coordinates[0]?.toString() || '',
    waterType: water.waterType || '',
  });
  const [fishTags, setFishTags] = useState(water.fishSpecies || []);
  const [dominantFish, setDominantFish] = useState(water.dominantFish || []);
  const [bestSeasons, setBestSeasons] = useState(water.bestSeasons || []);
  const [coordMode, setCoordMode] = useState('manual');
  const [newFiles, setNewFiles] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleRemove = (publicId) => {
    setRemoveImages(prev => prev.includes(publicId) ? prev.filter(p => p !== publicId) : [...prev, publicId]);
  };

  const save = async () => {
    if (!form.name || !form.lat || !form.lng) { showToast("Назва та координати обов'язкові", 'error'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('lat', form.lat);
      fd.append('lng', form.lng);
      fd.append('description', form.description);
      fd.append('waterType', form.waterType);
      fd.append('fishSpecies', JSON.stringify(fishTags));
      fd.append('dominantFish', JSON.stringify(dominantFish));
      fd.append('bestSeasons', JSON.stringify(bestSeasons));
      if (removeImages.length) fd.append('removeImages', JSON.stringify(removeImages));
      newFiles.forEach(f => fd.append('images', f));

      const res = await fetch(`${API}/api/water/${water._id}`, { method: 'PUT', headers: authH(), body: fd });
      const data = await res.json();
      if (res.ok) { showToast('Водойму оновлено! ✅'); onSaved(); }
      else showToast(data.error || 'Помилка оновлення', 'error');
    } catch { showToast('Помилка запиту', 'error'); }
    finally { setLoading(false); }
  };

  const waterTypeOptions = filterConfig?.waterTypes || [];
  const dominantFishOptions = (filterConfig?.filterFish || []).map(f => ({ value: f.name, label: f.name }));

  return (
    <div style={{ animation:'fadeUp 0.25s ease' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:26, paddingBottom:18, borderBottom:'1px solid #f1f5f9' }}>
        <button onClick={onCancel} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'1px solid #e2e8f0', borderRadius:9, padding:'7px 12px', cursor:'pointer', color:'#64748b', fontSize:13, fontWeight:500, fontFamily:'inherit' }}>
          <ArrowLeftIcon /> Назад
        </button>
        <div>
          <div style={{ fontWeight:700, fontSize:16, color:'#0f172a' }}>Редагування водойми</div>
          <div style={{ fontSize:12, color:'#94a3b8', marginTop:1 }}>{water.name}</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'460px 1fr', gap:22 }}>
        <Card>
          <div style={{ display:'flex', flexDirection:'column', gap:15 }}>
            <Field label="Назва" required>
              <Inp value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Оз. Синє…" />
            </Field>
            <Field label="Тип водойми">
              <Sel value={form.waterType} onChange={e => setForm(p => ({ ...p, waterType: e.target.value }))} placeholder="— Обрати тип —">
                {waterTypeOptions.map(t => <option key={t._id || t} value={t.name || t}>{t.emoji ? `${t.emoji} ${t.name}` : t.name || t}</option>)}
              </Sel>
            </Field>
            <Field label="Опис">
              <Inp as="textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Розташування, доступ…" />
            </Field>
            <Field label="Координати" required>
              <CoordModeSelector coordMode={coordMode} setCoordMode={setCoordMode} />
              {coordMode === 'manual' ? (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <Inp value={form.lat} onChange={e => setForm(p => ({ ...p, lat: e.target.value }))} placeholder="Широта 49.12…" />
                  <Inp value={form.lng} onChange={e => setForm(p => ({ ...p, lng: e.target.value }))} placeholder="Довгота 25.67…" />
                </div>
              ) : (
                <>
                  <MapPicker lat={form.lat} lng={form.lng} onSelect={(la, ln) => setForm(p => ({ ...p, lat: la, lng: ln }))} />
                  {form.lat && form.lng && (
                    <div style={{ marginTop:8, padding:'7px 12px', borderRadius:9, background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#059669', fontSize:12.5, fontWeight:500, display:'flex', alignItems:'center', gap:6 }}>
                      <CheckIcon /> {form.lat}, {form.lng}
                    </div>
                  )}
                </>
              )}
            </Field>

            <SectionDivider label="Риби та фільтри" />

            <FishTagger value={fishTags} onChange={setFishTags} allFish={fishList} />

            {dominantFishOptions.length > 0 && (
              <ChipPicker label="Переважаючі риби (фільтри)" options={dominantFishOptions} value={dominantFish} onChange={setDominantFish} colorScheme="blue" />
            )}

            <ChipPicker label="Найкращі сезони" options={SEASON_OPTIONS} value={bestSeasons} onChange={setBestSeasons} colorScheme="green" />

            <SectionDivider label="Фотографії" />
            <ExistingImages images={water.images} toRemove={removeImages} onToggleRemove={toggleRemove} label="Поточні фото (× щоб видалити)" />
            <ImageZone files={newFiles} onChange={setNewFiles} label="Додати нові фото" multiple />

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:4 }}>
              <Btn onClick={onCancel} variant="outline" color="#64748b">Скасувати</Btn>
              <Btn onClick={save} disabled={loading} color="#2563eb">
                <SaveIcon /> {loading ? 'Зберігаємо…' : 'Зберегти'}
              </Btn>
            </div>
          </div>
        </Card>

        <div>
          <div style={{ fontWeight:700, fontSize:15, color:'#1e293b', marginBottom:14 }}>Попередній перегляд</div>
          <Card>
            {water.images && water.images.length > 0 && (
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#64748b', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.04em' }}>Фото</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {water.images.map((img, i) => {
                    const removing = removeImages.includes(img.publicId);
                    return (
                      <div key={i} style={{ position:'relative' }}>
                        <img src={img.url} alt="" style={{ width:80, height:80, objectFit:'cover', borderRadius:10, border:`2px solid ${removing ? '#ef4444' : '#e2e8f0'}`, opacity: removing ? 0.3 : 1, transition:'all 0.2s' }} />
                        {removing && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#ef4444', background:'rgba(255,255,255,0.1)', borderRadius:10 }}>ВИДАЛИТИ</div>}
                      </div>
                    );
                  })}
                  {newFiles.map((f, i) => (
                    <div key={`new-${i}`} style={{ position:'relative' }}>
                      <img src={URL.createObjectURL(f)} alt="" style={{ width:80, height:80, objectFit:'cover', borderRadius:10, border:'2px solid #bbf7d0' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ fontWeight:700, fontSize:18, color:'#0f172a', marginBottom:6 }}>{form.name || <span style={{ color:'#cbd5e1' }}>Назва водойми</span>}</div>
            {form.waterType && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#f0fdf4', borderRadius:8, padding:'4px 10px', fontSize:12, color:'#059669', marginBottom:8, fontWeight:600, border:'1px solid #bbf7d0' }}>
                {waterTypeOptions.find(t => (t.name || t) === form.waterType)?.emoji || '💧'} {form.waterType}
              </div>
            )}
            {form.lat && form.lng && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#f1f5f9', borderRadius:8, padding:'4px 10px', fontSize:12, color:'#64748b', marginBottom:12, fontWeight:500, marginLeft:6 }}>
                <PinIcon /> {parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)}
              </div>
            )}
            {form.description && <div style={{ fontSize:13.5, color:'#475569', lineHeight:1.6, marginBottom:14 }}>{form.description}</div>}
            {dominantFish.length > 0 && (
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#64748b', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>Переважаючі риби</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {dominantFish.map(t => <span key={t} style={{ background:'#eff6ff', color:'#2563eb', borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:500 }}>{t}</span>)}
                </div>
              </div>
            )}
            {bestSeasons.length > 0 && (
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:'#64748b', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>Найкращі сезони</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {bestSeasons.map(s => {
                    const opt = SEASON_OPTIONS.find(o => o.value === s);
                    return <span key={s} style={{ background:'#f0fdf4', color:'#059669', borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:500 }}>{opt?.label || s}</span>;
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EDIT FISH FORM
// ═══════════════════════════════════════════════════════════════
function EditFishForm({ fish, authH, onSaved, onCancel, showToast }) {
  const [form, setForm] = useState({
    name: fish.name || '',
    scientificName: fish.scientificName || '',
    description: fish.description || '',
    maxWeight: fish.maxWeight?.toString() || '',
    maxLength: fish.maxLength?.toString() || '',
  });
  const [newFile, setNewFile] = useState([]);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!form.name) { showToast('Назва риби обовʼязкова', 'error'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('scientificName', form.scientificName);
      fd.append('description', form.description);
      if (form.maxWeight) fd.append('maxWeight', form.maxWeight);
      if (form.maxLength) fd.append('maxLength', form.maxLength);
      if (removeImage) fd.append('removeImage', 'true');
      if (newFile[0]) fd.append('image', newFile[0]);

      const res = await fetch(`${API}/api/fish/${fish._id}`, { method: 'PUT', headers: authH(), body: fd });
      const data = await res.json();
      if (res.ok) { showToast('Рибу оновлено! ✅'); onSaved(); }
      else showToast(data.error || 'Помилка оновлення', 'error');
    } catch { showToast('Помилка запиту', 'error'); }
    finally { setLoading(false); }
  };

  const currentImageUrl = newFile[0] ? URL.createObjectURL(newFile[0]) : (removeImage ? null : fish.image?.url);

  return (
    <div style={{ animation:'fadeUp 0.25s ease' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:26, paddingBottom:18, borderBottom:'1px solid #f1f5f9' }}>
        <button onClick={onCancel} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'1px solid #e2e8f0', borderRadius:9, padding:'7px 12px', cursor:'pointer', color:'#64748b', fontSize:13, fontWeight:500, fontFamily:'inherit' }}>
          <ArrowLeftIcon /> Назад
        </button>
        <div>
          <div style={{ fontWeight:700, fontSize:16, color:'#0f172a' }}>Редагування риби</div>
          <div style={{ fontSize:12, color:'#94a3b8', marginTop:1 }}>{fish.name}</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'420px 1fr', gap:22 }}>
        <Card>
          <div style={{ display:'flex', flexDirection:'column', gap:15 }}>
            <Field label="Назва" required><Inp value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Коропа, Окунь…" /></Field>
            <Field label="Наукова назва"><Inp value={form.scientificName} onChange={e => setForm(p => ({ ...p, scientificName: e.target.value }))} placeholder="Cyprinus carpio…" /></Field>
            <Field label="Опис"><Inp as="textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Поведінка, наживки, сезон…" /></Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Макс. вага (кг)"><Inp type="number" min="0" step="0.1" value={form.maxWeight} onChange={e => setForm(p => ({ ...p, maxWeight: e.target.value }))} placeholder="15" /></Field>
              <Field label="Макс. довжина (см)"><Inp type="number" min="0" value={form.maxLength} onChange={e => setForm(p => ({ ...p, maxLength: e.target.value }))} placeholder="90" /></Field>
            </div>
            <SectionDivider label="Фото риби" />
            {fish.image?.url && !newFile[0] && (
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:'#64748b', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em' }}>Поточне фото</div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <img src={fish.image.url} alt="" style={{ width:72, height:72, objectFit:'cover', borderRadius:10, border:`2px solid ${removeImage ? '#ef4444' : '#e2e8f0'}`, opacity: removeImage ? 0.35 : 1, transition:'all 0.15s' }} />
                  <button onClick={() => setRemoveImage(!removeImage)}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:9, border:`1px solid ${removeImage ? '#fecaca' : '#e2e8f0'}`, background: removeImage ? '#fef2f2' : 'white', color: removeImage ? '#dc2626' : '#64748b', cursor:'pointer', fontSize:12.5, fontWeight:500, fontFamily:'inherit', transition:'all 0.15s' }}>
                    {removeImage ? <><PlusIcon /> Відновити</> : <><TrashIcon /> Видалити фото</>}
                  </button>
                </div>
                {removeImage && <div style={{ fontSize:11, color:'#ef4444', marginTop:5, fontWeight:500 }}>⚠️ Фото буде видалено після збереження</div>}
              </div>
            )}
            <ImageZone files={newFile} onChange={f => { setNewFile(f.slice(-1)); if (f.length) setRemoveImage(false); }} label={fish.image?.url ? 'Замінити фото' : 'Завантажити фото'} multiple={false} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:4 }}>
              <Btn onClick={onCancel} variant="outline" color="#64748b">Скасувати</Btn>
              <Btn onClick={save} disabled={loading} color="#059669" shadow="rgba(5,150,105,0.2)">
                <SaveIcon /> {loading ? 'Зберігаємо…' : 'Зберегти'}
              </Btn>
            </div>
          </div>
        </Card>
        <div>
          <div style={{ fontWeight:700, fontSize:15, color:'#1e293b', marginBottom:14 }}>Картка риби</div>
          <Card>
            <div style={{ display:'flex', gap:18, alignItems:'flex-start', marginBottom:18 }}>
              <div style={{ width:100, height:100, borderRadius:14, background:'#f1f5f9', flexShrink:0, overflow:'hidden', border:'1px solid #e2e8f0' }}>
                {currentImageUrl ? <img src={currentImageUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#cbd5e1', fontSize:32 }}>🐟</div>}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:20, color:'#0f172a', marginBottom:3 }}>{form.name || <span style={{ color:'#cbd5e1' }}>Назва</span>}</div>
                {form.scientificName && <div style={{ fontSize:13, color:'#94a3b8', fontStyle:'italic', marginBottom:10 }}>{form.scientificName}</div>}
                <div style={{ display:'flex', gap:7 }}>
                  {form.maxWeight && <span style={{ background:'#f1f5f9', borderRadius:8, padding:'4px 10px', fontSize:12, color:'#475569', fontWeight:500 }}>⚖️ до {form.maxWeight} кг</span>}
                  {form.maxLength && <span style={{ background:'#f1f5f9', borderRadius:8, padding:'4px 10px', fontSize:12, color:'#475569', fontWeight:500 }}>📏 до {form.maxLength} см</span>}
                </div>
              </div>
            </div>
            {form.description && <div style={{ background:'#f8fafc', borderRadius:11, padding:'12px 14px', fontSize:13.5, color:'#475569', lineHeight:1.65, border:'1px solid #f1f5f9' }}>{form.description}</div>}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FILTERS TAB
// ═══════════════════════════════════════════════════════════════
function FiltersTab({ authH, showToast }) {
  const [waterTypes, setWaterTypes] = useState([]);
  const [filterFish, setFilterFish] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const [wtForm, setWtForm] = useState({ name:'', emoji:'', description:'' });
  const [wtSaving, setWtSaving] = useState(false);

  const [ffForm, setFfForm] = useState({ name:'', emoji:'' });
  const [ffSaving, setFfSaving] = useState(false);

  const [editingWt, setEditingWt] = useState(null);
  const [editingFf, setEditingFf] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [wtR, ffR] = await Promise.all([
        fetch(`${API}/api/filters/water-types`),
        fetch(`${API}/api/filters/fish`),
      ]);
      if (wtR.ok) setWaterTypes(await wtR.json());
      if (ffR.ok) setFilterFish(await ffR.json());
    } catch { showToast('Помилка завантаження фільтрів', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const addWaterType = async () => {
    if (!wtForm.name.trim()) { showToast("Назва типу обов'язкова", 'error'); return; }
    setWtSaving(true);
    try {
      const res = await fetch(`${API}/api/filters/water-types`, {
        method:'POST', headers: { ...authH(), 'Content-Type':'application/json' },
        body: JSON.stringify(wtForm),
      });
      const data = await res.json();
      if (res.ok) { showToast('Тип водойми додано! ✅'); setWtForm({ name:'', emoji:'', description:'' }); load(); }
      else showToast(data.error || 'Помилка', 'error');
    } catch { showToast('Помилка запиту', 'error'); }
    finally { setWtSaving(false); }
  };

  const saveWaterType = async () => {
    if (!editingWt.name.trim()) { showToast("Назва обов'язкова", 'error'); return; }
    try {
      const res = await fetch(`${API}/api/filters/water-types/${editingWt._id}`, {
        method:'PUT', headers: { ...authH(), 'Content-Type':'application/json' },
        body: JSON.stringify(editingWt),
      });
      if (res.ok) { showToast('Оновлено! ✅'); setEditingWt(null); load(); }
      else showToast('Помилка', 'error');
    } catch { showToast('Помилка запиту', 'error'); }
  };

  const deleteWaterType = (id, name) => {
    setConfirm({
      message: `Видалити тип водойми "${name}"?`,
      onConfirm: async () => {
        setConfirm(null);
        const res = await fetch(`${API}/api/filters/water-types/${id}`, { method:'DELETE', headers: authH() });
        if (res.ok) { showToast('Видалено'); load(); }
        else showToast('Помилка видалення', 'error');
      }
    });
  };

  const addFilterFish = async () => {
    if (!ffForm.name.trim()) { showToast("Назва риби обов'язкова", 'error'); return; }
    setFfSaving(true);
    try {
      const res = await fetch(`${API}/api/filters/fish`, {
        method:'POST', headers: { ...authH(), 'Content-Type':'application/json' },
        body: JSON.stringify(ffForm),
      });
      const data = await res.json();
      if (res.ok) { showToast('Рибу додано до фільтрів! 🐟'); setFfForm({ name:'', emoji:'' }); load(); }
      else showToast(data.error || 'Помилка', 'error');
    } catch { showToast('Помилка запиту', 'error'); }
    finally { setFfSaving(false); }
  };

  const saveFilterFish = async () => {
    if (!editingFf.name.trim()) { showToast("Назва обов'язкова", 'error'); return; }
    try {
      const res = await fetch(`${API}/api/filters/fish/${editingFf._id}`, {
        method:'PUT', headers: { ...authH(), 'Content-Type':'application/json' },
        body: JSON.stringify(editingFf),
      });
      if (res.ok) { showToast('Оновлено! ✅'); setEditingFf(null); load(); }
      else showToast('Помилка', 'error');
    } catch { showToast('Помилка запиту', 'error'); }
  };

  const deleteFilterFish = (id, name) => {
    setConfirm({
      message: `Видалити "${name}" з фільтрів?`,
      onConfirm: async () => {
        setConfirm(null);
        const res = await fetch(`${API}/api/filters/fish/${id}`, { method:'DELETE', headers: authH() });
        if (res.ok) { showToast('Видалено'); load(); }
        else showToast('Помилка видалення', 'error');
      }
    });
  };

  if (loading) return (
    <div style={{ textAlign:'center', padding:60, color:'#94a3b8' }}>
      <div style={{ fontSize:28, marginBottom:8 }}>⚙️</div>
      <div style={{ fontSize:14 }}>Завантаження фільтрів…</div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom:26 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:'#0f172a', letterSpacing:'-0.02em' }}>Фільтри та категорії</h1>
        <p style={{ color:'#64748b', margin:'4px 0 0', fontSize:13.5 }}>Керуйте типами водойм, рибами для фільтрів і сезонами</p>
      </div>

      <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:14, padding:'14px 18px', marginBottom:24, display:'flex', gap:12, alignItems:'flex-start' }}>
        <span style={{ fontSize:18 }}>ℹ️</span>
        <div style={{ fontSize:13.5, color:'#1d4ed8', lineHeight:1.6 }}>
          <strong>Як це працює:</strong> Типи водойм і риби-фільтри використовуються при додаванні/редагуванні водойм. На фронтенді карти відвідувачі можуть фільтрувати водойми за типом, переважаючою рибою та сезоном.
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        <div>
          <Card>
            <CardHead icon={<WaterIcon />} iconBg="#f0fdf4" iconColor="#059669" title="Типи водойм" sub="Ставок, озеро, річка, платна водойма…" />
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
              {editingWt ? (
                <>
                  <div style={{ fontSize:13, fontWeight:600, color:'#0f172a', marginBottom:4 }}>✏️ Редагування</div>
                  <div style={{ display:'grid', gridTemplateColumns:'60px 1fr', gap:10 }}>
                    <div>
                      <div style={{ fontSize:11, color:'#64748b', marginBottom:5, fontWeight:600 }}>EMOJI</div>
                      <Inp value={editingWt.emoji} onChange={e => setEditingWt(p => ({ ...p, emoji: e.target.value }))} placeholder="🏞️" style={{ textAlign:'center', fontSize:18 }} />
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:'#64748b', marginBottom:5, fontWeight:600 }}>НАЗВА *</div>
                      <Inp value={editingWt.name} onChange={e => setEditingWt(p => ({ ...p, name: e.target.value }))} placeholder="Назва типу" />
                    </div>
                  </div>
                  <Inp as="textarea" value={editingWt.description || ''} onChange={e => setEditingWt(p => ({ ...p, description: e.target.value }))} placeholder="Короткий опис типу…" style={{ minHeight:60 }} />
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    <Btn onClick={() => setEditingWt(null)} variant="outline" color="#64748b" style={{ padding:'9px' }}>Скасувати</Btn>
                    <Btn onClick={saveWaterType} color="#059669" shadow="rgba(5,150,105,0.2)" style={{ padding:'9px' }}><SaveIcon /> Зберегти</Btn>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'60px 1fr', gap:10 }}>
                    <div>
                      <div style={{ fontSize:11, color:'#64748b', marginBottom:5, fontWeight:600 }}>EMOJI</div>
                      <Inp value={wtForm.emoji} onChange={e => setWtForm(p => ({ ...p, emoji: e.target.value }))} placeholder="🏞️" style={{ textAlign:'center', fontSize:18 }} />
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:'#64748b', marginBottom:5, fontWeight:600 }}>НАЗВА *</div>
                      <Inp value={wtForm.name} onChange={e => setWtForm(p => ({ ...p, name: e.target.value }))} placeholder="Ставок, Озеро, Платна…"
                        onKeyDown={e => { if (e.key === 'Enter') addWaterType(); }} />
                    </div>
                  </div>
                  <Inp as="textarea" value={wtForm.description} onChange={e => setWtForm(p => ({ ...p, description: e.target.value }))} placeholder="Короткий опис типу…" style={{ minHeight:52 }} />
                  <Btn onClick={addWaterType} disabled={wtSaving} color="#059669" shadow="rgba(5,150,105,0.2)" style={{ padding:'10px' }}>
                    <PlusIcon /> {wtSaving ? 'Додаємо…' : 'Додати тип водойми'}
                  </Btn>
                </>
              )}
            </div>

            <SectionDivider label={`Усього: ${waterTypes.length}`} />

            <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:14, maxHeight:360, overflowY:'auto' }}>
              {waterTypes.length === 0 ? (
                <div style={{ textAlign:'center', padding:'28px 16px', color:'#94a3b8' }}>
                  <div style={{ fontSize:26, marginBottom:6 }}>💧</div>
                  <div style={{ fontSize:13 }}>Типів водойм ще немає</div>
                </div>
              ) : waterTypes.map(wt => (
                <div key={wt._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:11, border:'1px solid #f1f5f9', background:'white' }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                    {wt.emoji || '💧'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:13.5, color:'#1e293b' }}>{wt.name}</div>
                    {wt.description && <div style={{ fontSize:11.5, color:'#94a3b8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{wt.description}</div>}
                  </div>
                  <div style={{ display:'flex', gap:5 }}>
                    <button onClick={() => setEditingWt({ ...wt })}
                      style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:7, padding:6, cursor:'pointer', color:'#64748b', display:'flex', transition:'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b'; }}>
                      <EditIcon />
                    </button>
                    <button onClick={() => deleteWaterType(wt._id, wt.name)}
                      style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:7, padding:6, cursor:'pointer', color:'#94a3b8', display:'flex', transition:'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}>
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <CardHead icon={<FishIcon />} iconBg="#eff6ff" iconColor="#2563eb" title="Риби для фільтрів" sub="Короп, Карась, Форель, Щука…" />

            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
              {editingFf ? (
                <>
                  <div style={{ fontSize:13, fontWeight:600, color:'#0f172a', marginBottom:4 }}>✏️ Редагування</div>
                  <div style={{ display:'grid', gridTemplateColumns:'60px 1fr', gap:10 }}>
                    <div>
                      <div style={{ fontSize:11, color:'#64748b', marginBottom:5, fontWeight:600 }}>EMOJI</div>
                      <Inp value={editingFf.emoji || ''} onChange={e => setEditingFf(p => ({ ...p, emoji: e.target.value }))} placeholder="🐟" style={{ textAlign:'center', fontSize:18 }} />
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:'#64748b', marginBottom:5, fontWeight:600 }}>НАЗВА *</div>
                      <Inp value={editingFf.name} onChange={e => setEditingFf(p => ({ ...p, name: e.target.value }))} placeholder="Короп…" />
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    <Btn onClick={() => setEditingFf(null)} variant="outline" color="#64748b" style={{ padding:'9px' }}>Скасувати</Btn>
                    <Btn onClick={saveFilterFish} color="#2563eb" style={{ padding:'9px' }}><SaveIcon /> Зберегти</Btn>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'60px 1fr', gap:10 }}>
                    <div>
                      <div style={{ fontSize:11, color:'#64748b', marginBottom:5, fontWeight:600 }}>EMOJI</div>
                      <Inp value={ffForm.emoji} onChange={e => setFfForm(p => ({ ...p, emoji: e.target.value }))} placeholder="🐟" style={{ textAlign:'center', fontSize:18 }} />
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:'#64748b', marginBottom:5, fontWeight:600 }}>НАЗВА РИБИ *</div>
                      <Inp value={ffForm.name} onChange={e => setFfForm(p => ({ ...p, name: e.target.value }))} placeholder="Короп, Форель, Щука…"
                        onKeyDown={e => { if (e.key === 'Enter') addFilterFish(); }} />
                    </div>
                  </div>
                  <Btn onClick={addFilterFish} disabled={ffSaving} color="#2563eb" style={{ padding:'10px' }}>
                    <PlusIcon /> {ffSaving ? 'Додаємо…' : 'Додати рибу до фільтрів'}
                  </Btn>
                </>
              )}
            </div>

            <SectionDivider label={`Усього: ${filterFish.length}`} />

            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:14, maxHeight:360, overflowY:'auto' }}>
              {filterFish.length === 0 ? (
                <div style={{ textAlign:'center', width:'100%', padding:'28px 16px', color:'#94a3b8' }}>
                  <div style={{ fontSize:26, marginBottom:6 }}>🐟</div>
                  <div style={{ fontSize:13 }}>Риб для фільтрів ще немає</div>
                </div>
              ) : filterFish.map(ff => (
                <div key={ff._id} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 12px 6px 8px', borderRadius:20, border:'1px solid #e2e8f0', background:'white' }}>
                  <span style={{ fontSize:16 }}>{ff.emoji || '🐟'}</span>
                  <span style={{ fontSize:13, fontWeight:500, color:'#1e293b' }}>{ff.name}</span>
                  <button onClick={() => setEditingFf({ ...ff })}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:0, display:'flex', marginLeft:2, transition:'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                    <EditIcon />
                  </button>
                  <button onClick={() => deleteFilterFish(ff._id, ff.name)}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:0, display:'flex', transition:'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                    <XIcon />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card style={{ marginTop:24 }}>
        <CardHead icon={<SunIcon />} iconBg="#fff7ed" iconColor="#ea580c" title="Сезони ловлі" sub="Вбудовані — не потребують налаштування" />
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {[
            { emoji:'🌱', label:'Весна', desc:'Березень — Травень', color:'#059669', bg:'#f0fdf4', border:'#bbf7d0' },
            { emoji:'☀️', label:'Літо',  desc:'Червень — Серпень',  color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
            { emoji:'🍂', label:'Осінь', desc:'Вересень — Листопад', color:'#ea580c', bg:'#fff7ed', border:'#fed7aa' },
            { emoji:'❄️', label:'Зима',  desc:'Грудень — Лютий',   color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe' },
          ].map(s => (
            <div key={s.label} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderRadius:12, background:s.bg, border:`1px solid ${s.border}`, flex:'1 1 180px' }}>
              <span style={{ fontSize:24 }}>{s.emoji}</span>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:s.color }}>{s.label}</div>
                <div style={{ fontSize:12, color:'#64748b', marginTop:1 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:14, padding:'10px 14px', borderRadius:10, background:'#f8fafc', border:'1px solid #f1f5f9', fontSize:12.5, color:'#64748b', lineHeight:1.6 }}>
          При редагуванні водойми вкажіть в яких сезонах ловиться риба найкраще — це відобразиться на карті як фільтр.
        </div>
      </Card>

      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN ADMIN PANEL
// ═══════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('water');

  const [waterBodies, setWaterBodies] = useState([]);
  const [fishList, setFishList] = useState([]);
  const [filterConfig, setFilterConfig] = useState({ waterTypes: [], filterFish: [] });
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const [editingWater, setEditingWater] = useState(null);
  const [editingFish, setEditingFish] = useState(null);

  const [wForm, setWF] = useState({ name:'', lat:'', lng:'', description:'', waterType:'' });
  const [wFiles, setWFiles] = useState([]);
  const [fishTags, setFishTags] = useState([]);
  const [dominantFish, setDominantFish] = useState([]);
  const [bestSeasons, setBestSeasons] = useState([]);
  const [coordMode, setCoordMode] = useState('manual');

  const [fForm, setFF] = useState({ name:'', scientificName:'', description:'', maxWeight:'', maxLength:'' });
  const [fFile, setFFile] = useState([]);

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);
  const authH = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loadData = useCallback(async (tok) => {
    const t = tok || token;
    if (!t) return;
    try {
      const [wR, fR, sR, wtR, ffR] = await Promise.all([
        fetch(`${API}/api/water`),
        fetch(`${API}/api/fish`),
        fetch(`${API}/api/stats`),
        fetch(`${API}/api/filters/water-types`),
        fetch(`${API}/api/filters/fish`),
      ]);
      if (wR.ok) setWaterBodies(await wR.json());
      if (fR.ok) setFishList(await fR.json());
      if (sR.ok) setStats(await sR.json());
      const wt = wtR.ok ? await wtR.json() : [];
      const ff = ffR.ok ? await ffR.json() : [];
      setFilterConfig({ waterTypes: wt, filterFish: ff });
    } catch { showToast('Помилка завантаження', 'error'); }
  }, [token, showToast]);

  useEffect(() => {
    const t = localStorage.getItem('adminToken');
    if (t) { setToken(t); loadData(t); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addWater = async () => {
    if (!wForm.name || !wForm.lat || !wForm.lng) { showToast("Назва та координати обов'язкові", 'error'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', wForm.name); fd.append('lat', wForm.lat); fd.append('lng', wForm.lng);
      fd.append('description', wForm.description);
      fd.append('waterType', wForm.waterType);
      if (fishTags.length) fd.append('fishSpecies', JSON.stringify(fishTags));
      if (dominantFish.length) fd.append('dominantFish', JSON.stringify(dominantFish));
      if (bestSeasons.length) fd.append('bestSeasons', JSON.stringify(bestSeasons));
      wFiles.forEach(f => fd.append('images', f));
      const res = await fetch(`${API}/api/water`, { method:'POST', headers:authH(), body:fd });
      const data = await res.json();
      if (res.ok) {
        showToast('Водойму додано! 🗺️');
        setWF({ name:'', lat:'', lng:'', description:'', waterType:'' });
        setWFiles([]); setFishTags([]); setDominantFish([]); setBestSeasons([]);
        loadData();
      } else showToast(data.error || 'Помилка', 'error');
    } catch { showToast('Помилка запиту', 'error'); }
    finally { setLoading(false); }
  };

  const deleteWater = (id, name) => {
    setConfirm({
      message: `Видалити водойму "${name}"? Це незворотна дія.`,
      onConfirm: async () => {
        setConfirm(null);
        const res = await fetch(`${API}/api/water/${id}`, { method:'DELETE', headers:authH() });
        if (res.ok) { showToast('Водойму видалено'); loadData(); }
        else showToast('Помилка видалення', 'error');
      }
    });
  };

  const addFish = async () => {
    if (!fForm.name) { showToast('Назва риби обовʼязкова', 'error'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', fForm.name); fd.append('scientificName', fForm.scientificName);
      fd.append('description', fForm.description);
      if (fForm.maxWeight) fd.append('maxWeight', fForm.maxWeight);
      if (fForm.maxLength) fd.append('maxLength', fForm.maxLength);
      if (fFile[0]) fd.append('image', fFile[0]);
      const res = await fetch(`${API}/api/fish`, { method:'POST', headers:authH(), body:fd });
      const data = await res.json();
      if (res.ok) { showToast('Рибу додано! 🐟'); setFF({ name:'', scientificName:'', description:'', maxWeight:'', maxLength:'' }); setFFile([]); loadData(); }
      else showToast(data.error || 'Помилка', 'error');
    } catch { showToast('Помилка запиту', 'error'); }
    finally { setLoading(false); }
  };

  const deleteFish = (id, name) => {
    setConfirm({
      message: `Видалити "${name}" з довідника? Це незворотна дія.`,
      onConfirm: async () => {
        setConfirm(null);
        const res = await fetch(`${API}/api/fish/${id}`, { method:'DELETE', headers:authH() });
        if (res.ok) { showToast('Рибу видалено'); loadData(); }
        else showToast('Помилка видалення', 'error');
      }
    });
  };

  const TABS = [
    { id:'water',   label:'Водойми',       icon:<WaterIcon />,  badge: waterBodies.length },
    { id:'fish',    label:'Довідник риб',  icon:<FishIcon />,   badge: fishList.length },
    { id:'filters', label:'Фільтри',       icon:<FilterIcon />, badge: filterConfig.waterTypes.length + filterConfig.filterFish.length },
    { id:'stats',   label:'Статистика',    icon:<StatsIcon /> },
  ];

  const dominantFishOptions = filterConfig.filterFish.map(f => ({ value: f.name, label: `${f.emoji || '🐟'} ${f.name}` }));

  if (editingWater) {
    return (
      <>
        <style>{CSS_GLOBAL}</style>
        <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
          <NavBar breadcrumb="Редагування водойми" />
          <div style={{ maxWidth:1340, margin:'0 auto', padding:'32px 32px 72px', animation:'fadeUp 0.28s ease' }}>
            <EditWaterForm water={editingWater} fishList={fishList} filterConfig={filterConfig} authH={authH} showToast={showToast}
              onSaved={() => { setEditingWater(null); loadData(); }} onCancel={() => setEditingWater(null)} />
          </div>
        </div>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </>
    );
  }

  if (editingFish) {
    return (
      <>
        <style>{CSS_GLOBAL}</style>
        <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
          <NavBar breadcrumb="Редагування риби" />
          <div style={{ maxWidth:1340, margin:'0 auto', padding:'32px 32px 72px', animation:'fadeUp 0.28s ease' }}>
            <EditFishForm fish={editingFish} authH={authH} showToast={showToast}
              onSaved={() => { setEditingFish(null); loadData(); }} onCancel={() => setEditingFish(null)} />
          </div>
        </div>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </>
    );
  }

  return (
    <>
      <style>{CSS_GLOBAL}</style>
      <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Segoe UI', system-ui, sans-serif", color:'#1e293b' }}>

        <div style={{ background:'white', borderBottom:'1px solid #e2e8f0', padding:'0 32px', display:'flex', alignItems:'center', gap:2, boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'15px 0', marginRight:20 }}>
            <span style={{ fontSize:18 }}>🎣</span>
            <span style={{ fontWeight:700, fontSize:14, color:'#0f172a', letterSpacing:'0.04em' }}>ARUNDO</span>
            <span style={{ color:'#d1d5db', margin:'0 6px' }}>/</span>
            <span style={{ fontSize:13, color:'#64748b', fontWeight:500 }}>Адміністратор</span>
          </div>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display:'flex', alignItems:'center', gap:7, padding:'16px 16px 14px', border:'none', background:'none', cursor:'pointer', color: activeTab === tab.id ? '#2563eb' : '#64748b', fontWeight: activeTab === tab.id ? 600 : 500, fontSize:14, borderBottom:`2px solid ${activeTab === tab.id ? '#2563eb' : 'transparent'}`, transition:'all 0.15s', fontFamily:'inherit' }}>
              {tab.icon} {tab.label}
              {tab.badge !== undefined && (
                <span style={{ background: activeTab === tab.id ? '#eff6ff' : '#f1f5f9', color: activeTab === tab.id ? '#2563eb' : '#94a3b8', borderRadius:20, padding:'1px 7px', fontSize:11.5, fontWeight:700 }}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        <div style={{ maxWidth:1340, margin:'0 auto', padding:'32px 32px 72px', animation:'fadeUp 0.28s ease' }}>

          {activeTab === 'water' && (
            <div>
              <div style={{ marginBottom:26 }}>
                <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:'#0f172a', letterSpacing:'-0.02em' }}>Водойми на карті</h1>
                <p style={{ color:'#64748b', margin:'4px 0 0', fontSize:13.5 }}>Додавайте та керуйте рибальськими водоймами</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'460px 1fr', gap:22 }}>
                <Card>
                  <CardHead icon={<PlusIcon />} iconBg="#eff6ff" iconColor="#2563eb" title="Нова водойма" sub="Заповніть і збережіть" />
                  <div style={{ display:'flex', flexDirection:'column', gap:15 }}>
                    <Field label="Назва" required>
                      <Inp value={wForm.name} onChange={e => setWF(p => ({ ...p, name: e.target.value }))} placeholder="Оз. Синє, р. Горинь…" />
                    </Field>
                    <Field label="Тип водойми">
                      <Sel value={wForm.waterType} onChange={e => setWF(p => ({ ...p, waterType: e.target.value }))} placeholder="— Обрати тип —">
                        {filterConfig.waterTypes.map(t => <option key={t._id} value={t.name}>{t.emoji ? `${t.emoji} ${t.name}` : t.name}</option>)}
                      </Sel>
                    </Field>
                    <Field label="Опис">
                      <Inp as="textarea" value={wForm.description} onChange={e => setWF(p => ({ ...p, description: e.target.value }))} placeholder="Розташування, доступ…" />
                    </Field>
                    <Field label="Координати" required>
                      <CoordModeSelector coordMode={coordMode} setCoordMode={setCoordMode} />
                      {coordMode === 'manual' ? (
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                          <Inp value={wForm.lat} onChange={e => setWF(p => ({ ...p, lat: e.target.value }))} placeholder="Широта 49.12…" />
                          <Inp value={wForm.lng} onChange={e => setWF(p => ({ ...p, lng: e.target.value }))} placeholder="Довгота 25.67…" />
                        </div>
                      ) : (
                        <>
                          <MapPicker lat={wForm.lat} lng={wForm.lng} onSelect={(la, ln) => setWF(p => ({ ...p, lat: la, lng: ln }))} />
                          {wForm.lat && wForm.lng && (
                            <div style={{ marginTop:8, padding:'7px 12px', borderRadius:9, background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#059669', fontSize:12.5, fontWeight:500, display:'flex', alignItems:'center', gap:6 }}>
                              <CheckIcon /> {wForm.lat}, {wForm.lng}
                            </div>
                          )}
                        </>
                      )}
                    </Field>
                    <FishTagger value={fishTags} onChange={setFishTags} allFish={fishList} />
                    {dominantFishOptions.length > 0 && (
                      <ChipPicker label="Переважаючі риби (фільтри)" options={dominantFishOptions} value={dominantFish} onChange={setDominantFish} colorScheme="blue" />
                    )}
                    <ChipPicker label="Найкращі сезони" options={SEASON_OPTIONS} value={bestSeasons} onChange={setBestSeasons} colorScheme="green" />
                    <ImageZone files={wFiles} onChange={setWFiles} label="Фотографії" multiple />
                    <Btn onClick={addWater} disabled={loading}><PlusIcon /> {loading ? 'Зберігаємо…' : 'Додати водойму'}</Btn>
                  </div>
                </Card>

                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:'#1e293b' }}>Усі водойми</div>
                    <div style={{ fontSize:13, color:'#94a3b8' }}>{waterBodies.length} об&apos;єктів</div>
                  </div>
                  <Card style={{ padding:14 }}>
                    {waterBodies.length === 0 ? (
                      <div style={{ textAlign:'center', padding:'44px 20px', color:'#94a3b8' }}>
                        <div style={{ fontSize:34, marginBottom:8 }}>🗺️</div>
                        <div style={{ fontSize:14, fontWeight:500, color:'#64748b' }}>Водойм поки немає</div>
                        <div style={{ fontSize:13, marginTop:3 }}>Додайте першу через форму ліворуч</div>
                      </div>
                    ) : (
                      <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:700, overflowY:'auto', paddingRight:2 }}>
                        {waterBodies.map(w => (
                          <Row key={w._id}
                            thumb={w.images?.[0]?.url} fallback={<WaterIcon />}
                            title={w.name}
                            sub={
                              <span style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                                <span>{w.location?.coordinates[1]?.toFixed(4)}, {w.location?.coordinates[0]?.toFixed(4)}</span>
                                {w.waterType && <span style={{ background:'#f0fdf4', color:'#059669', borderRadius:6, padding:'1px 7px', fontSize:11, fontWeight:600 }}>{w.waterType}</span>}
                                {w.bestSeasons?.length > 0 && w.bestSeasons.map(s => {
                                  const opt = SEASON_OPTIONS.find(o => o.value === s);
                                  return <span key={s} style={{ background:'#fffbeb', color:'#d97706', borderRadius:6, padding:'1px 7px', fontSize:11, fontWeight:600 }}>{opt?.label || s}</span>;
                                })}
                              </span>
                            }
                            tags={w.dominantFish?.length ? w.dominantFish : w.fishSpecies}
                            onEdit={() => setEditingWater(w)}
                            onDelete={() => deleteWater(w._id, w.name)}
                          />
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fish' && (
            <div>
              <div style={{ marginBottom:26 }}>
                <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:'#0f172a', letterSpacing:'-0.02em' }}>Довідник риб</h1>
                <p style={{ color:'#64748b', margin:'4px 0 0', fontSize:13.5 }}>Інформація про види риб для рибалок</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'420px 1fr', gap:22 }}>
                <Card>
                  <CardHead icon={<PlusIcon />} iconBg="#f0fdf4" iconColor="#059669" title="Нова риба" sub="Додайте вид до довідника" />
                  <div style={{ display:'flex', flexDirection:'column', gap:15 }}>
                    <Field label="Назва" required><Inp value={fForm.name} onChange={e => setFF(p => ({ ...p, name: e.target.value }))} placeholder="Коропа, Окунь, Щука…" /></Field>
                    <Field label="Наукова назва"><Inp value={fForm.scientificName} onChange={e => setFF(p => ({ ...p, scientificName: e.target.value }))} placeholder="Cyprinus carpio…" /></Field>
                    <Field label="Опис"><Inp as="textarea" value={fForm.description} onChange={e => setFF(p => ({ ...p, description: e.target.value }))} placeholder="Поведінка, наживки, сезон…" /></Field>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <Field label="Макс. вага (кг)"><Inp type="number" min="0" step="0.1" value={fForm.maxWeight} onChange={e => setFF(p => ({ ...p, maxWeight: e.target.value }))} placeholder="15" /></Field>
                      <Field label="Макс. довжина (см)"><Inp type="number" min="0" value={fForm.maxLength} onChange={e => setFF(p => ({ ...p, maxLength: e.target.value }))} placeholder="90" /></Field>
                    </div>
                    <ImageZone files={fFile} onChange={f => setFFile(f.slice(-1))} label="Фото риби" multiple={false} />
                    <Btn onClick={addFish} disabled={loading} color="#059669" shadow="rgba(5,150,105,0.2)">
                      <PlusIcon /> {loading ? 'Зберігаємо…' : 'Додати до довідника'}
                    </Btn>
                  </div>
                </Card>
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:'#1e293b' }}>Довідник</div>
                    <div style={{ fontSize:13, color:'#94a3b8' }}>{fishList.length} видів</div>
                  </div>
                  <Card style={{ padding:14 }}>
                    {fishList.length === 0 ? (
                      <div style={{ textAlign:'center', padding:'44px 20px', color:'#94a3b8' }}>
                        <div style={{ fontSize:34, marginBottom:8 }}>🐟</div>
                        <div style={{ fontSize:14, fontWeight:500, color:'#64748b' }}>Довідник порожній</div>
                      </div>
                    ) : (
                      <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:660, overflowY:'auto', paddingRight:2 }}>
                        {fishList.map(f => (
                          <Row key={f._id} thumb={f.image?.url} fallback={<FishIcon />} title={f.name} sub={f.scientificName || undefined}
                            extra={(f.maxWeight || f.maxLength) ? (
                              <div style={{ display:'flex', gap:6, marginTop:5 }}>
                                {f.maxWeight && <span style={{ fontSize:11.5, color:'#64748b', background:'#f1f5f9', borderRadius:6, padding:'2px 8px' }}>⚖️ до {f.maxWeight} кг</span>}
                                {f.maxLength && <span style={{ fontSize:11.5, color:'#64748b', background:'#f1f5f9', borderRadius:6, padding:'2px 8px' }}>📏 до {f.maxLength} см</span>}
                              </div>
                            ) : null}
                            onEdit={() => setEditingFish(f)} onDelete={() => deleteFish(f._id, f.name)} />
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'filters' && (
            <FiltersTab authH={authH} showToast={showToast} />
          )}

          {activeTab === 'stats' && (
            <div>
              <div style={{ marginBottom:26 }}>
                <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:'#0f172a', letterSpacing:'-0.02em' }}>Статистика</h1>
                <p style={{ color:'#64748b', margin:'4px 0 0', fontSize:13.5 }}>Загальна інформація про платформу</p>
              </div>
              {stats ? (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:18, marginBottom:24 }}>
                    {[
                      { label:'Водойм на карті',    val:stats.total_water_bodies, emoji:'🗺️', color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe' },
                      { label:'Видів у довіднику',  val:stats.total_fish_species,  emoji:'🐟', color:'#059669', bg:'#f0fdf4', border:'#bbf7d0' },
                      { label:'Типів водойм',        val:filterConfig.waterTypes.length, emoji:'💧', color:'#ea580c', bg:'#fff7ed', border:'#fed7aa' },
                      { label:'Користувачів',        val:stats.total_users,          emoji:'👥', color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe' },
                    ].map(s => (
                      <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:18, padding:'24px 26px' }}>
                        <div style={{ fontSize:30, marginBottom:10 }}>{s.emoji}</div>
                        <div style={{ fontSize:40, fontWeight:900, color:s.color, letterSpacing:'-0.04em', lineHeight:1 }}>{s.val}</div>
                        <div style={{ fontSize:13.5, color:'#64748b', marginTop:8, fontWeight:500 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                    <Card>
                      <div style={{ fontWeight:700, fontSize:15, marginBottom:18, color:'#1e293b' }}>Останні водойми</div>
                      {waterBodies.length === 0 && <div style={{ color:'#94a3b8', fontSize:13 }}>Немає водойм</div>}
                      {waterBodies.slice(0, 6).map((w, i) => (
                        <div key={w._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom: i < Math.min(5, waterBodies.length-1) ? '1px solid #f1f5f9' : 'none' }}>
                          <div>
                            <div style={{ fontSize:14, fontWeight:500, color:'#334155' }}>{w.name}</div>
                            {w.waterType && <div style={{ fontSize:11, color:'#64748b' }}>{w.waterType}</div>}
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ fontSize:12, color:'#94a3b8' }}>{w.fishSpecies?.length || 0} видів</div>
                            <button onClick={() => { setActiveTab('water'); setTimeout(() => setEditingWater(w), 50); }}
                              style={{ background:'#eff6ff', border:'none', borderRadius:7, padding:'4px 8px', cursor:'pointer', color:'#2563eb', fontSize:11, fontWeight:600, fontFamily:'inherit' }}>Ред.</button>
                          </div>
                        </div>
                      ))}
                    </Card>
                    <Card>
                      <div style={{ fontWeight:700, fontSize:15, marginBottom:18, color:'#1e293b' }}>Довідник риб</div>
                      {fishList.length === 0 && <div style={{ color:'#94a3b8', fontSize:13 }}>Порожньо</div>}
                      {fishList.slice(0, 6).map((f, i) => (
                        <div key={f._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom: i < Math.min(5, fishList.length-1) ? '1px solid #f1f5f9' : 'none' }}>
                          <div>
                            <div style={{ fontSize:14, fontWeight:500, color:'#334155' }}>{f.name}</div>
                            {f.scientificName && <div style={{ fontSize:11, color:'#94a3b8', fontStyle:'italic' }}>{f.scientificName}</div>}
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ fontSize:12, color:'#94a3b8' }}>{f.maxWeight ? `≤${f.maxWeight} кг` : '—'}</div>
                            <button onClick={() => { setActiveTab('fish'); setTimeout(() => setEditingFish(f), 50); }}
                              style={{ background:'#f0fdf4', border:'none', borderRadius:7, padding:'4px 8px', cursor:'pointer', color:'#059669', fontSize:11, fontWeight:600, fontFamily:'inherit' }}>Ред.</button>
                          </div>
                        </div>
                      ))}
                    </Card>
                  </div>
                </>
              ) : (
                <div style={{ textAlign:'center', padding:72, color:'#94a3b8' }}>
                  <div style={{ fontSize:34, marginBottom:8 }}>📊</div>
                  <div style={{ fontSize:14 }}>Завантаження статистики…</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
    </>
  );
}

function NavBar({ breadcrumb }) {
  return (
    <div style={{ background:'white', borderBottom:'1px solid #e2e8f0', padding:'0 32px', display:'flex', alignItems:'center', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'15px 0' }}>
        <span style={{ fontSize:18 }}>🎣</span>
        <span style={{ fontWeight:700, fontSize:14, color:'#0f172a', letterSpacing:'0.04em' }}>ARUNDO</span>
        <span style={{ color:'#d1d5db', margin:'0 6px' }}>/</span>
        <span style={{ fontSize:13, color:'#64748b', fontWeight:500 }}>{breadcrumb}</span>
      </div>
    </div>
  );
}

const CSS_GLOBAL = `
  * { box-sizing: border-box; }
  @keyframes toastIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  input:focus, textarea:focus, select:focus { border-color:#2563eb!important; box-shadow:0 0 0 3px rgba(37,99,235,0.1)!important; outline:none; }
  input::placeholder, textarea::placeholder { color:#cbd5e1; }
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:3px; }
`;