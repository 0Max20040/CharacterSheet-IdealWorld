import { useState, useRef, useEffect } from 'react';

interface CharacterData {
  name: string;
  races: string[];
  beastType: string;
  foxTails: number;
  elements: string[];
  cultureType: string;
  rank: string;
  strength: number;
  agility: number;
  intelligence: number;
  health: number;
  hpCurrent: number;
  hpMax: number;
  baseSpeed: number;
  will: number;
  perception: number;
  fatigueCurrent: number;
  fatigueMax: number;
  magicVesselCurrent: number;
  magicVesselMax: number;
  characterImage: string | null;
}

const RACE_OPTIONS = [
  'Человек', 'Зверолюд', 'Слайм', 'Разумный Слайм', 'Одно Благо',
  'Десятки Благо', 'Сотня Благо', 'Вечное Благо', 'Дракон', 'Божество',
];

const BEAST_TYPES = ['кошачья', 'собачья', 'волчья', 'крольчья', 'лисья'];

const ELEMENT_OPTIONS = [
  'Душа', 'Земля', 'Флора', 'Дар', 'Связь', 'Призыв', 'Свет', 'Тьма',
  'Молния', 'Вода', 'Огонь', 'Лёд', 'Температура', 'Негативная энергия Смерти',
  'Культура', 'Ветер', 'Смерть', 'Кровь', 'Время',
];

const CULTURE_TYPES = [
  'Культура: Создание', 'Культура: Аура', 'Культура: Физический',
  'Культура: Магический', 'Культура: Духовный',
];

const DEFAULT_CHARACTER: CharacterData = {
  name: '', races: [], beastType: '', foxTails: 1, elements: [], cultureType: '', rank: '',
  strength: 10, agility: 10, intelligence: 10, health: 10,
  hpCurrent: 10, hpMax: 10, baseSpeed: 5, will: 10, perception: 10,
  fatigueCurrent: 10, fatigueMax: 10, magicVesselCurrent: 10, magicVesselMax: 10,
  characterImage: null,
};

const C = {
  bg1: '#0a0a0f', bg2: '#12121a', bg3: '#1a1a2e', bg4: '#16162a',
  brd: '#2a2a4a', ac1: '#7c3aed', ac2: '#a855f7',
  t1: '#e2e8f0', t2: '#94a3b8', t3: '#64748b',
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.ac2, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span style={{ width: '4px', height: '16px', background: `linear-gradient(180deg, ${C.ac1}, ${C.ac2})`, borderRadius: '2px', display: 'inline-block' }}></span>
    {children}
  </div>
);

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ backgroundColor: C.bg4, border: `1px solid ${C.brd}`, borderRadius: '12px', padding: '24px', ...style }}>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, style, type = 'text' }: { value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; style?: React.CSSProperties; type?: string }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ width: '100%', padding: '10px 14px', backgroundColor: C.bg2, border: `1px solid ${C.brd}`, borderRadius: '8px', color: C.t1, fontSize: '14px', outline: 'none', ...style }} />
);

const NumInput = ({ value, onChange, style, step }: { value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; style?: React.CSSProperties; step?: string }) => (
  <input type="number" value={value} onChange={onChange} step={step} style={{ padding: '8px', textAlign: 'center', fontSize: '18px', fontWeight: 700, backgroundColor: C.bg3, border: `1px solid ${C.brd}`, borderRadius: '8px', color: C.t1, outline: 'none', ...style }} />
);

const Btn = ({ children, onClick, primary }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) => (
  <button onClick={onClick} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', backgroundColor: primary ? undefined : C.bg3, background: primary ? `linear-gradient(135deg, ${C.ac1}, ${C.ac2})` : undefined, color: 'white', border: primary ? 'none' : `1px solid ${C.brd}` }}>
    {children}
  </button>
);

function App() {
  const [ch, setCh] = useState<CharacterData>(DEFAULT_CHARACTER);
  const [showEl, setShowEl] = useState(false);
  const [showRace, setShowRace] = useState(false);
  const [showCult, setShowCult] = useState(false);
  const [showBeast, setShowBeast] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const loadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCh(p => ({
      ...p,
      hpMax: p.strength,
      baseSpeed: (p.agility + p.health) / 4,
      will: p.intelligence,
      perception: p.intelligence,
      fatigueMax: p.health,
      magicVesselMax: p.health,
    }));
  }, [ch.strength, ch.agility, ch.intelligence, ch.health]);

  const notify = (m: string) => { setNotif(m); setTimeout(() => setNotif(null), 3000); };
  const upd = (f: keyof CharacterData, v: any) => setCh(p => ({ ...p, [f]: v }));

  const toggleRace = (r: string) => setCh(p => ({ ...p, races: p.races.includes(r) ? p.races.filter(x => x !== r) : [...p.races, r] }));
  const toggleEl = (e: string) => setCh(p => ({ ...p, elements: p.elements.includes(e) ? p.elements.filter(x => x !== e) : [...p.elements, e] }));

  const raceDisplay = () => ch.races.map(r => {
    if (r === 'Зверолюд') {
      if (ch.beastType === 'лисья') return `Зверолюд: лисья (${ch.foxTails} хвостов)`;
      return ch.beastType ? `Зверолюд: ${ch.beastType}` : 'Зверолюд';
    }
    return r;
  }).join(', ');

  const elDisplay = () => ch.elements.map(e => e === 'Культура' && ch.cultureType ? ch.cultureType : e).join(', ');

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { const r = new FileReader(); r.onload = ev => upd('characterImage', ev.target?.result as string); r.readAsDataURL(f); }
  };

  const saveJSON = () => {
    const b = new Blob([JSON.stringify(ch, null, 2)], { type: 'application/json' });
    const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `${ch.name || 'character'}.json`; a.click(); URL.revokeObjectURL(u);
    notify('Сохранено!');
  };

  const loadJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { const r = new FileReader(); r.onload = ev => { try { setCh({ ...DEFAULT_CHARACTER, ...JSON.parse(ev.target?.result as string) }); notify('Загружено!'); } catch { notify('Ошибка!'); } }; r.readAsText(f); }
    if (loadRef.current) loadRef.current.value = '';
  };

  const saveLS = () => { localStorage.setItem('dm_char', JSON.stringify(ch)); notify('Сохранено в браузере!'); };
  const loadLS = () => { const s = localStorage.getItem('dm_char'); if (s) { try { setCh({ ...DEFAULT_CHARACTER, ...JSON.parse(s) }); notify('Загружено!'); } catch { notify('Ошибка!'); } } else notify('Нет данных!'); };

  const exportTxt = () => {
    const t = `═══════════════════════════════════════════\n  DISTORTED MULTIVERSE - IDEAL WORLD\n  ЛИСТ ПЕРСОНАЖА\n═══════════════════════════════════════════\n\n▸ ГЛАВНОЕ\n  Имя: ${ch.name || '—'}\n  Раса: ${raceDisplay() || '—'}\n  Элементы: ${elDisplay() || '—'}\n  Ранг: ${ch.rank || '—'}\n\n▸ ОСНОВНЫЕ ХАРАКТЕРИСТИКИ\n  Сила (СЛ): ${ch.strength}\n  Ловкость (ЛВ): ${ch.agility}\n  Интеллект (ИН): ${ch.intelligence}\n  Здоровье (ЗД): ${ch.health}\n\n▸ ПОБОЧНЫЕ ХАРАКТЕРИСТИКИ\n  ОЗ: ${ch.hpCurrent}/${ch.hpMax}\n  БС: ${ch.baseSpeed}\n  ВЛ: ${ch.will}\n  ВП: ${ch.perception}\n  ЕУ: ${ch.fatigueCurrent}/${ch.fatigueMax}\n  МН: ${ch.magicVesselCurrent}/${ch.magicVesselMax}\n\n═══════════════════════════════════════════`;
    const b = new Blob([t], { type: 'text/plain;charset=utf-8' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `${ch.name || 'character'}.txt`; a.click(); URL.revokeObjectURL(u);
    notify('Экспортировано в TXT!');
  };

  const exportPng = () => {
    if (!sheetRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 1200; canvas.height = 1400;
      ctx.fillStyle = C.bg1; ctx.fillRect(0, 0, 1200, 1400);
      ctx.fillStyle = C.ac2; ctx.font = 'bold 28px Arial';
      ctx.fillText('DISTORTED MULTIVERSE - IDEAL WORLD', 50, 50);
      ctx.fillStyle = C.t1; ctx.font = '20px Arial';
      ctx.fillText('ЛИСТ ПЕРСОНАЖА', 50, 85);
      let y = 140;
      ctx.font = 'bold 16px Arial'; ctx.fillStyle = C.ac2; ctx.fillText('ГЛАВНОЕ', 50, y); y += 30;
      ctx.font = '14px Arial'; ctx.fillStyle = C.t1;
      ctx.fillText(`Имя: ${ch.name || '—'}`, 70, y); y += 22;
      ctx.fillText(`Раса: ${raceDisplay() || '—'}`, 70, y); y += 22;
      ctx.fillText(`Элементы: ${elDisplay() || '—'}`, 70, y); y += 22;
      ctx.fillText(`Ранг: ${ch.rank || '—'}`, 70, y); y += 40;
      ctx.font = 'bold 16px Arial'; ctx.fillStyle = C.ac2; ctx.fillText('ОСНОВНЫЕ ХАРАКТЕРИСТИКИ', 50, y); y += 30;
      ctx.font = '14px Arial'; ctx.fillStyle = C.t1;
      ctx.fillText(`Сила (СЛ): ${ch.strength}`, 70, y); y += 22;
      ctx.fillText(`Ловкость (ЛВ): ${ch.agility}`, 70, y); y += 22;
      ctx.fillText(`Интеллект (ИН): ${ch.intelligence}`, 70, y); y += 22;
      ctx.fillText(`Здоровье (ЗД): ${ch.health}`, 70, y); y += 40;
      ctx.font = 'bold 16px Arial'; ctx.fillStyle = C.ac2; ctx.fillText('ПОБОЧНЫЕ ХАРАКТЕРИСТИКИ', 50, y); y += 30;
      ctx.font = '14px Arial'; ctx.fillStyle = C.t1;
      ctx.fillText(`ОЗ: ${ch.hpCurrent}/${ch.hpMax}`, 70, y); y += 22;
      ctx.fillText(`БС: ${ch.baseSpeed}`, 70, y); y += 22;
      ctx.fillText(`ВЛ: ${ch.will}`, 70, y); y += 22;
      ctx.fillText(`ВП: ${ch.perception}`, 70, y); y += 22;
      ctx.fillText(`ЕУ: ${ch.fatigueCurrent}/${ch.fatigueMax}`, 70, y); y += 22;
      ctx.fillText(`МН: ${ch.magicVesselCurrent}/${ch.magicVesselMax}`, 70, y);
      const u = canvas.toDataURL('image/png'); const a = document.createElement('a'); a.href = u; a.download = `${ch.name || 'character'}.png`; a.click();
      notify('Экспортировано в PNG!');
    } catch { notify('Ошибка экспорта PNG!'); }
  };

  useEffect(() => {
    const h = () => { setShowEl(false); setShowRace(false); setShowCult(false); setShowBeast(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  const ddStyle: React.CSSProperties = { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: C.bg2, border: `1px solid ${C.brd}`, borderRadius: '8px', marginTop: '4px', maxHeight: '240px', overflowY: 'auto', zIndex: 50, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' };
  const ddItem = (sel: boolean): React.CSSProperties => ({ padding: '10px 14px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: sel ? `${C.ac1}26` : 'transparent', color: sel ? C.ac2 : C.t1 });
  const ddBtn = (hasVal: boolean): React.CSSProperties => ({ width: '100%', padding: '10px 14px', backgroundColor: C.bg3, border: `1px solid ${C.brd}`, borderRadius: '8px', color: hasVal ? C.t1 : C.t3, fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' });
  const tagStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', backgroundColor: `${C.ac1}26`, border: `1px solid ${C.ac1}4d`, borderRadius: '20px', fontSize: '12px', color: C.ac2 };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: C.t3 };
  const statBox = (label: string, children: React.ReactNode) => (
    <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: C.bg2 }}>
      <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.t3, marginBottom: '8px' }}>{label}</div>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg1, color: C.t1, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {notif && <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 100, backgroundColor: C.bg4, border: `1px solid ${C.ac1}`, borderRadius: '8px', padding: '12px 20px', color: C.ac2, fontSize: '14px', boxShadow: `0 4px 20px ${C.ac1}4d` }}>{notif}</div>}

      <header style={{ background: `linear-gradient(135deg, ${C.ac1}1a, ${C.ac2}0d)`, borderBottom: `1px solid ${C.brd}`, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `linear-gradient(135deg, ${C.ac1}, ${C.ac2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>✦</div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: C.t1, margin: 0 }}>DISTORTED MULTIVERSE</h1>
              <p style={{ fontSize: '12px', color: C.t3, letterSpacing: '2px', margin: 0 }}>IDEAL WORLD — ЛИСТ ПЕРСОНАЖА</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Btn onClick={saveLS}>💾 Сохранить</Btn>
            <Btn onClick={loadLS}>📂 Загрузить</Btn>
            <Btn onClick={saveJSON}>📁 JSON</Btn>
            <Btn onClick={() => loadRef.current?.click()}>📥 Импорт</Btn>
            <Btn onClick={exportTxt}>📄 TXT</Btn>
            <Btn onClick={exportPng} primary>🖼️ PNG</Btn>
            <input ref={loadRef} type="file" accept=".json" style={{ display: 'none' }} onChange={loadJSON} />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        <div ref={sheetRef} style={{ backgroundColor: C.bg1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '32px' }}>
            <Card>
              <SectionTitle>АРТЫ ПЕРСОНАЖА</SectionTitle>
              <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${C.brd}`, borderRadius: '12px', width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                {ch.characterImage ? <img src={ch.characterImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} /> : <div style={{ textAlign: 'center', padding: '24px' }}><div style={{ fontSize: '36px', opacity: 0.5, marginBottom: '12px' }}>🖼️</div><p style={{ fontSize: '14px', color: C.t3 }}>Нет видимых артов</p><p style={{ fontSize: '12px', color: C.t3, marginTop: '8px' }}>Нажмите для загрузки</p></div>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Card>
                <SectionTitle>ГЛАВНОЕ</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Имя персонажа</label>
                    <Input value={ch.name} onChange={e => upd('name', e.target.value)} placeholder="Введите имя..." style={{ fontSize: '16px', fontWeight: 500 }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Ранг</label>
                    <Input value={ch.rank} onChange={e => upd('rank', e.target.value)} placeholder="напр.: боец I ранга (5 012 очков)" />
                  </div>
                </div>
              </Card>

              <Card>
                <SectionTitle>РАСА</SectionTitle>
                <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowRace(!showRace)} style={ddBtn(ch.races.length > 0)}><span>{ch.races.length > 0 ? raceDisplay() : '+ ADD GENETIC VARIANT'}</span><span>▾</span></button>
                  {showRace && <div style={ddStyle}>{RACE_OPTIONS.map(r => <div key={r} onClick={() => { toggleRace(r); if (r !== 'Зверолюд') setShowRace(false); }} style={ddItem(ch.races.includes(r))}><span>{ch.races.includes(r) ? '✓' : '○'}</span><span>{r}</span></div>)}</div>}
                </div>
                {ch.races.includes('Зверолюд') && <div style={{ marginTop: '16px' }}>
                  <div style={{ position: 'relative', marginBottom: '12px' }} onClick={e => e.stopPropagation()}>
                    <label style={labelStyle}>Тип звероялюда</label>
                    <button onClick={() => setShowBeast(!showBeast)} style={ddBtn(!!ch.beastType)}><span>{ch.beastType || 'Выберите тип...'}</span><span>▾</span></button>
                    {showBeast && <div style={ddStyle}>{BEAST_TYPES.map(t => <div key={t} onClick={() => { upd('beastType', t); setShowBeast(false); }} style={ddItem(ch.beastType === t)}><span>{ch.beastType === t ? '✓' : '○'}</span><span>{t}</span></div>)}</div>}
                  </div>
                  {ch.beastType === 'лисья' && <div><label style={labelStyle}>Количество хвостов</label><Input type="number" value={ch.foxTails} onChange={e => upd('foxTails', parseInt(e.target.value) || 1)} /></div>}
                </div>}
                {ch.races.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>{ch.races.map(r => <span key={r} style={tagStyle}>{r === 'Зверолюд' ? raceDisplay() : r}<span onClick={() => toggleRace(r)} style={{ cursor: 'pointer', opacity: 0.7 }}>✕</span></span>)}</div>}
              </Card>

              <Card>
                <SectionTitle>ЭЛЕМЕНТЫ</SectionTitle>
                <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowEl(!showEl)} style={ddBtn(ch.elements.length > 0)}><span>{ch.elements.length > 0 ? `${ch.elements.length} выбрано` : '+ ADD ELEMENTAL RESONANCE'}</span><span>▾</span></button>
                  {showEl && <div style={ddStyle}>{ELEMENT_OPTIONS.map(el => <div key={el} onClick={() => { toggleEl(el); if (el === 'Культура') setShowCult(true); }} style={ddItem(ch.elements.includes(el))}><span>{ch.elements.includes(el) ? '✓' : '○'}</span><span>{el}</span></div>)}</div>}
                </div>
                {ch.elements.includes('Культура') && <div style={{ marginTop: '16px' }} onClick={e => e.stopPropagation()}>
                  <label style={labelStyle}>Тип Культуры</label>
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowCult(!showCult)} style={ddBtn(!!ch.cultureType)}><span>{ch.cultureType || 'Выберите тип культуры...'}</span><span>▾</span></button>
                    {showCult && <div style={ddStyle}>{CULTURE_TYPES.map(t => <div key={t} onClick={() => { upd('cultureType', t); setShowCult(false); }} style={ddItem(ch.cultureType === t)}><span>{ch.cultureType === t ? '✓' : '○'}</span><span>{t}</span></div>)}</div>}
                  </div>
                </div>}
                {ch.elements.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>{ch.elements.map(el => <span key={el} style={tagStyle}>{el === 'Культура' && ch.cultureType ? ch.cultureType : el}<span onClick={() => toggleEl(el)} style={{ cursor: 'pointer', opacity: 0.7 }}>✕</span></span>)}</div>}
              </Card>
            </div>
          </div>

          <Card style={{ marginBottom: '32px' }}>
            <SectionTitle>ОСНОВНЫЕ ХАРАКТЕРИСТИКИ</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {[{ l: 'СИЛА (СЛ)', v: ch.strength, f: 'strength' as const }, { l: 'ЛОВКОСТЬ (ЛВ)', v: ch.agility, f: 'agility' as const }, { l: 'ИНТЕЛЛЕКТ (ИН)', v: ch.intelligence, f: 'intelligence' as const }, { l: 'ЗДОРОВЬЕ (ЗД)', v: ch.health, f: 'health' as const }].map(s => (
                <div key={s.l} style={{ textAlign: 'center', padding: '16px', borderRadius: '12px', backgroundColor: C.bg2 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.t3, marginBottom: '8px' }}>{s.l}</div>
                  <input type="number" value={s.v} onChange={e => upd(s.f, parseInt(e.target.value) || 0)} style={{ fontSize: '28px', fontWeight: 700, color: C.t1, textAlign: 'center', width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none' }} />
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ marginBottom: '32px' }}>
            <SectionTitle>ПОБОЧНЫЕ ХАРАКТЕРИСТИКИ</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {statBox('ОЧКИ ЗДОРОВЬЯ (ОЗ)', <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><NumInput value={ch.hpCurrent} onChange={e => upd('hpCurrent', parseInt(e.target.value) || 0)} style={{ width: '70px' }} /><span style={{ color: C.t3 }}>/</span><NumInput value={ch.hpMax} onChange={e => upd('hpMax', parseInt(e.target.value) || 0)} style={{ width: '70px' }} /><span style={{ fontSize: '12px', color: C.t3, marginLeft: '8px' }}>= СЛ</span></div>)}
              {statBox('СКОРОСТЬ (БС)', <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><NumInput value={ch.baseSpeed} onChange={e => upd('baseSpeed', parseFloat(e.target.value) || 0)} style={{ width: '100px' }} step="0.25" /><span style={{ fontSize: '12px', color: C.t3, marginLeft: '8px' }}>= (ЛВ+ЗД)/4</span></div>)}
              {statBox('ВОЛЯ (ВЛ)', <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><NumInput value={ch.will} onChange={e => upd('will', parseInt(e.target.value) || 0)} style={{ width: '70px' }} /><span style={{ fontSize: '12px', color: C.t3, marginLeft: '8px' }}>= ИН</span></div>)}
              {statBox('ВОСПРИЯТИЕ (ВП)', <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><NumInput value={ch.perception} onChange={e => upd('perception', parseInt(e.target.value) || 0)} style={{ width: '70px' }} /><span style={{ fontSize: '12px', color: C.t3, marginLeft: '8px' }}>= ИН</span></div>)}
              {statBox('УСТАЛОСТЬ (ЕУ)', <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><NumInput value={ch.fatigueCurrent} onChange={e => upd('fatigueCurrent', parseInt(e.target.value) || 0)} style={{ width: '70px' }} /><span style={{ color: C.t3 }}>/</span><NumInput value={ch.fatigueMax} onChange={e => upd('fatigueMax', parseInt(e.target.value) || 0)} style={{ width: '70px' }} /><span style={{ fontSize: '12px', color: C.t3, marginLeft: '8px' }}>= ЗД</span></div>)}
              {statBox('МАГИЧЕСКИЙ СОСУД (МН)', <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><NumInput value={ch.magicVesselCurrent} onChange={e => upd('magicVesselCurrent', parseInt(e.target.value) || 0)} style={{ width: '70px' }} /><span style={{ color: C.t3 }}>/</span><NumInput value={ch.magicVesselMax} onChange={e => upd('magicVesselMax', parseInt(e.target.value) || 0)} style={{ width: '70px' }} /><span style={{ fontSize: '12px', color: C.t3, marginLeft: '8px' }}>= ЕУ</span></div>)}
            </div>
          </Card>

          <Card>
            <SectionTitle>ОСОБОЕ</SectionTitle>
            <p style={{ fontSize: '14px', color: C.t3 }}>Дополнительные настройки характеристики</p>
            <div style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', border: `1px dashed ${C.brd}` }}>
              <p style={{ fontSize: '14px', textAlign: 'center', color: C.t3 }}>• ДОБАВИТЬ ОСОБОЕ</p>
            </div>
          </Card>
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '24px', borderTop: `1px solid ${C.brd}` }}>
        <p style={{ fontSize: '12px', color: C.t3 }}>DISTORTED MULTIVERSE — IDEAL WORLD © Character Sheet System</p>
      </footer>
    </div>
  );
}

export default App;
