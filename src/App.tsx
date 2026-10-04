import { useState, useRef, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';

// Types
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
  'Человек',
  'Зверолюд',
  'Слайм',
  'Разумный Слайм',
  'Одно Благо',
  'Десятки Благо',
  'Сотня Благо',
  'Вечное Благо',
  'Дракон',
  'Божество',
];

const BEAST_TYPES = ['кошачья', 'собачья', 'волчья', 'крольчья', 'лисья'];

const ELEMENT_OPTIONS = [
  'Душа',
  'Земля',
  'Флора',
  'Дар',
  'Связь',
  'Призыв',
  'Свет',
  'Тьма',
  'Молния',
  'Вода',
  'Огонь',
  'Лёд',
  'Температура',
  'Негативная энергия Смерти',
  'Культура',
  'Ветер',
  'Смерть',
  'Кровь',
  'Время',
];

const CULTURE_TYPES = [
  'Культура: Создание',
  'Культура: Аура',
  'Культура: Физический',
  'Культура: Магический',
  'Культура: Духовный',
];

const DEFAULT_CHARACTER: CharacterData = {
  name: '',
  races: [],
  beastType: '',
  foxTails: 1,
  elements: [],
  cultureType: '',
  rank: '',
  strength: 10,
  agility: 10,
  intelligence: 10,
  health: 10,
  hpCurrent: 10,
  hpMax: 10,
  baseSpeed: 5,
  will: 10,
  perception: 10,
  fatigueCurrent: 10,
  fatigueMax: 10,
  magicVesselCurrent: 10,
  magicVesselMax: 10,
  characterImage: null,
};

// Style constants
const colors = {
  bgPrimary: '#0a0a0f',
  bgSecondary: '#12121a',
  bgTertiary: '#1a1a2e',
  bgCard: '#16162a',
  border: '#2a2a4a',
  accentPrimary: '#7c3aed',
  accentSecondary: '#a855f7',
  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  danger: '#ef4444',
};

function App() {
  const [character, setCharacter] = useState<CharacterData>(DEFAULT_CHARACTER);
  const [showElementDropdown, setShowElementDropdown] = useState(false);
  const [showRaceDropdown, setShowRaceDropdown] = useState(false);
  const [showCultureDropdown, setShowCultureDropdown] = useState(false);
  const [showBeastDropdown, setShowBeastDropdown] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadInputRef = useRef<HTMLInputElement>(null);

  // Auto-calculate secondary stats
  useEffect(() => {
    setCharacter(prev => ({
      ...prev,
      hpMax: prev.strength,
      baseSpeed: (prev.agility + prev.health) / 4,
      will: prev.intelligence,
      perception: prev.intelligence,
      fatigueMax: prev.health,
      magicVesselMax: prev.health,
    }));
  }, [character.strength, character.agility, character.intelligence, character.health]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const updateField = (field: keyof CharacterData, value: any) => {
    setCharacter(prev => ({ ...prev, [field]: value }));
  };

  const toggleRace = (race: string) => {
    setCharacter(prev => {
      const races = prev.races.includes(race)
        ? prev.races.filter(r => r !== race)
        : [...prev.races, race];
      return { ...prev, races };
    });
  };

  const getRaceDisplay = () => {
    return character.races.map(race => {
      if (race === 'Зверолюд') {
        if (character.beastType === 'лисья') {
          return `Зверолюд: лисья (${character.foxTails} хвостов)`;
        }
        return character.beastType ? `Зверолюд: ${character.beastType}` : 'Зверолюд';
      }
      return race;
    }).join(', ');
  };

  const toggleElement = (element: string) => {
    setCharacter(prev => {
      const elements = prev.elements.includes(element)
        ? prev.elements.filter(e => e !== element)
        : [...prev.elements, element];
      return { ...prev, elements };
    });
  };

  const getElementDisplay = () => {
    return character.elements.map(el => {
      if (el === 'Культура' && character.cultureType) {
        return character.cultureType;
      }
      return el;
    }).join(', ');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateField('characterImage', ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveToFile = () => {
    const data = JSON.stringify(character, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name || 'character'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Данные сохранены в файл!');
  };

  const loadFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          setCharacter({ ...DEFAULT_CHARACTER, ...data });
          showNotification('Данные загружены из файла!');
        } catch {
          showNotification('Ошибка при загрузке файла!');
        }
      };
      reader.readAsText(file);
    }
    if (loadInputRef.current) loadInputRef.current.value = '';
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('dm_character', JSON.stringify(character));
    showNotification('Сохранено в браузере!');
  };

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('dm_character');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCharacter({ ...DEFAULT_CHARACTER, ...data });
        showNotification('Загружено из браузера!');
      } catch {
        showNotification('Ошибка при загрузке!');
      }
    } else {
      showNotification('Нет сохранённых данных!');
    }
  };

  const exportToTxt = () => {
    const txt = `═══════════════════════════════════════════
  DISTORTED MULTIVERSE - IDEAL WORLD
  ЛИСТ ПЕРСОНАЖА
═══════════════════════════════════════════

▸ ГЛАВНОЕ
  Имя: ${character.name || '—'}
  Раса: ${getRaceDisplay() || '—'}
  Элементы: ${getElementDisplay() || '—'}
  Ранг: ${character.rank || '—'}

▸ ОСНОВНЫЕ ХАРАКТЕРИСТИКИ
  Сила (СЛ): ${character.strength}
  Ловкость (ЛВ): ${character.agility}
  Интеллект (ИН): ${character.intelligence}
  Здоровье (ЗД): ${character.health}

▸ ПОБОЧНЫЕ ХАРАКТЕРИСТИКИ
  Очки Здоровья (ОЗ): ${character.hpCurrent}/${character.hpMax}
  Базовая Скорость (БС): ${character.baseSpeed}
  Воля (ВЛ): ${character.will}
  Восприятие (ВП): ${character.perception}
  Усталость (ЕУ): ${character.fatigueCurrent}/${character.fatigueMax}
  Магический сосуд (МН): ${character.magicVesselCurrent}/${character.magicVesselMax}

═══════════════════════════════════════════
`;
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name || 'character'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Экспортировано в TXT!');
  };

  const exportToPng = useCallback(async () => {
    if (!sheetRef.current) return;
    try {
      const canvas = await html2canvas(sheetRef.current, {
        backgroundColor: '#0a0a0f',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${character.name || 'character'}.png`;
      a.click();
      showNotification('Экспортировано в PNG!');
    } catch {
      showNotification('Ошибка при экспорте в PNG!');
    }
  }, [character.name]);

  useEffect(() => {
    const handleClick = () => {
      setShowElementDropdown(false);
      setShowRaceDropdown(false);
      setShowCultureDropdown(false);
      setShowBeastDropdown(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bgPrimary, color: colors.textPrimary, fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 100,
          backgroundColor: colors.bgCard,
          border: `1px solid ${colors.accentPrimary}`,
          borderRadius: '8px',
          padding: '12px 20px',
          color: colors.accentSecondary,
          fontSize: '14px',
          boxShadow: `0 4px 20px ${colors.accentPrimary}4d`,
        }}>
          {notification}
        </div>
      )}

      {/* Header */}
      <header style={{
        background: `linear-gradient(135deg, ${colors.accentPrimary}1a, ${colors.accentSecondary}0d)`,
        borderBottom: `1px solid ${colors.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${colors.accentPrimary}, ${colors.accentSecondary})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}>
              ✦
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, margin: 0 }}>
                DISTORTED MULTIVERSE
              </h1>
              <p style={{ fontSize: '12px', color: colors.textMuted, letterSpacing: '2px', margin: 0 }}>
                IDEAL WORLD — ЛИСТ ПЕРСОНАЖА
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={saveToLocalStorage} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', backgroundColor: colors.bgTertiary, color: colors.textPrimary, border: `1px solid ${colors.border}` }}>
              💾 Сохранить
            </button>
            <button onClick={loadFromLocalStorage} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', backgroundColor: colors.bgTertiary, color: colors.textPrimary, border: `1px solid ${colors.border}` }}>
              📂 Загрузить
            </button>
            <button onClick={saveToFile} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', backgroundColor: colors.bgTertiary, color: colors.textPrimary, border: `1px solid ${colors.border}` }}>
              📁 JSON
            </button>
            <button onClick={() => loadInputRef.current?.click()} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', backgroundColor: colors.bgTertiary, color: colors.textPrimary, border: `1px solid ${colors.border}` }}>
              📥 Импорт
            </button>
            <button onClick={exportToTxt} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', backgroundColor: colors.bgTertiary, color: colors.textPrimary, border: `1px solid ${colors.border}` }}>
              📄 TXT
            </button>
            <button onClick={exportToPng} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', background: `linear-gradient(135deg, ${colors.accentPrimary}, ${colors.accentSecondary})`, color: 'white', border: 'none' }}>
              🖼️ PNG
            </button>
            <input ref={loadInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={loadFromFile} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        <div ref={sheetRef} style={{ backgroundColor: colors.bgPrimary }}>
          {/* Character Image + Main Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '32px' }}>
            {/* Character Image */}
            <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: colors.accentSecondary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '4px', height: '16px', background: `linear-gradient(180deg, ${colors.accentPrimary}, ${colors.accentSecondary})`, borderRadius: '2px', display: 'inline-block' }}></span>
                АРТЫ ПЕРСОНАЖА
              </div>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${colors.border}`,
                  borderRadius: '12px',
                  width: '100%',
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {character.characterImage ? (
                  <img src={character.characterImage} alt="Персонаж" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{ fontSize: '36px', opacity: 0.5, marginBottom: '12px' }}>🖼️</div>
                    <p style={{ fontSize: '14px', color: colors.textMuted }}>Нет видимых артов</p>
                    <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '8px' }}>Нажмите для загрузки</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            </div>

            {/* Main Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Name & Rank */}
              <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: colors.accentSecondary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '4px', height: '16px', background: `linear-gradient(180deg, ${colors.accentPrimary}, ${colors.accentSecondary})`, borderRadius: '2px', display: 'inline-block' }}></span>
                  ГЛАВНОЕ
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: colors.textMuted }}>
                      Имя персонажа
                    </label>
                    <input
                      type="text"
                      placeholder="Введите имя..."
                      value={character.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', backgroundColor: colors.bgSecondary, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.textPrimary, fontSize: '16px', fontWeight: 500, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: colors.textMuted }}>
                      Ранг
                    </label>
                    <input
                      type="text"
                      placeholder="напр.: боец I ранга (5 012 очков)"
                      value={character.rank}
                      onChange={(e) => updateField('rank', e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', backgroundColor: colors.bgSecondary, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.textPrimary, fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Race */}
              <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: colors.accentSecondary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '4px', height: '16px', background: `linear-gradient(180deg, ${colors.accentPrimary}, ${colors.accentSecondary})`, borderRadius: '2px', display: 'inline-block' }}></span>
                  РАСА
                </div>
                <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setShowRaceDropdown(!showRaceDropdown)}
                    style={{ width: '100%', padding: '10px 14px', backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '8px', color: character.races.length > 0 ? colors.textPrimary : colors.textMuted, fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span>{character.races.length > 0 ? getRaceDisplay() : '+ ADD GENETIC VARIANT'}</span>
                    <span>▾</span>
                  </button>
                  {showRaceDropdown && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: colors.bgSecondary, border: `1px solid ${colors.border}`, borderRadius: '8px', marginTop: '4px', maxHeight: '240px', overflowY: 'auto', zIndex: 50, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                      {RACE_OPTIONS.map(race => (
                        <div
                          key={race}
                          onClick={() => { toggleRace(race); if (race !== 'Зверолюд') setShowRaceDropdown(false); }}
                          style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: character.races.includes(race) ? `${colors.accentPrimary}26` : 'transparent', color: character.races.includes(race) ? colors.accentSecondary : colors.textPrimary }}
                        >
                          <span>{character.races.includes(race) ? '✓' : '○'}</span>
                          <span>{race}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {character.races.includes('Зверолюд') && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ position: 'relative', marginBottom: '12px' }} onClick={(e) => e.stopPropagation()}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: colors.textMuted }}>
                        Тип звероялюда
                      </label>
                      <button
                        onClick={() => setShowBeastDropdown(!showBeastDropdown)}
                        style={{ width: '100%', padding: '10px 14px', backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '8px', color: character.beastType ? colors.textPrimary : colors.textMuted, fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <span>{character.beastType || 'Выберите тип...'}</span>
                        <span>▾</span>
                      </button>
                      {showBeastDropdown && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: colors.bgSecondary, border: `1px solid ${colors.border}`, borderRadius: '8px', marginTop: '4px', maxHeight: '240px', overflowY: 'auto', zIndex: 50, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                          {BEAST_TYPES.map(type => (
                            <div
                              key={type}
                              onClick={() => { updateField('beastType', type); setShowBeastDropdown(false); }}
                              style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: character.beastType === type ? `${colors.accentPrimary}26` : 'transparent', color: character.beastType === type ? colors.accentSecondary : colors.textPrimary }}
                            >
                              <span>{character.beastType === type ? '✓' : '○'}</span>
                              <span>{type}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {character.beastType === 'лисья' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: colors.textMuted }}>
                          Количество хвостов
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={character.foxTails}
                          onChange={(e) => updateField('foxTails', parseInt(e.target.value) || 1)}
                          style={{ width: '100%', padding: '10px 14px', backgroundColor: colors.bgSecondary, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.textPrimary, fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {character.races.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                    {character.races.map(race => (
                      <span key={race} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', backgroundColor: `${colors.accentPrimary}26`, border: `1px solid ${colors.accentPrimary}4d`, borderRadius: '20px', fontSize: '12px', color: colors.accentSecondary }}>
                        {race === 'Зверолюд' ? getRaceDisplay() : race}
                        <span onClick={() => toggleRace(race)} style={{ cursor: 'pointer', opacity: 0.7 }}>✕</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Elements */}
              <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: colors.accentSecondary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '4px', height: '16px', background: `linear-gradient(180deg, ${colors.accentPrimary}, ${colors.accentSecondary})`, borderRadius: '2px', display: 'inline-block' }}></span>
                  ЭЛЕМЕНТЫ
                </div>
                <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setShowElementDropdown(!showElementDropdown)}
                    style={{ width: '100%', padding: '10px 14px', backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '8px', color: character.elements.length > 0 ? colors.textPrimary : colors.textMuted, fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span>{character.elements.length > 0 ? `${character.elements.length} выбрано` : '+ ADD ELEMENTAL RESONANCE'}</span>
                    <span>▾</span>
                  </button>
                  {showElementDropdown && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: colors.bgSecondary, border: `1px solid ${colors.border}`, borderRadius: '8px', marginTop: '4px', maxHeight: '240px', overflowY: 'auto', zIndex: 50, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                      {ELEMENT_OPTIONS.map(element => (
                        <div
                          key={element}
                          onClick={() => { toggleElement(element); if (element === 'Культура') setShowCultureDropdown(true); }}
                          style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: character.elements.includes(element) ? `${colors.accentPrimary}26` : 'transparent', color: character.elements.includes(element) ? colors.accentSecondary : colors.textPrimary }}
                        >
                          <span>{character.elements.includes(element) ? '✓' : '○'}</span>
                          <span>{element}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {character.elements.includes('Культура') && (
                  <div style={{ marginTop: '16px' }} onClick={(e) => e.stopPropagation()}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: colors.textMuted }}>
                      Тип Культуры
                    </label>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setShowCultureDropdown(!showCultureDropdown)}
                        style={{ width: '100%', padding: '10px 14px', backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '8px', color: character.cultureType ? colors.textPrimary : colors.textMuted, fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <span>{character.cultureType || 'Выберите тип культуры...'}</span>
                        <span>▾</span>
                      </button>
                      {showCultureDropdown && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: colors.bgSecondary, border: `1px solid ${colors.border}`, borderRadius: '8px', marginTop: '4px', maxHeight: '240px', overflowY: 'auto', zIndex: 50, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                          {CULTURE_TYPES.map(type => (
                            <div
                              key={type}
                              onClick={() => { updateField('cultureType', type); setShowCultureDropdown(false); }}
                              style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: character.cultureType === type ? `${colors.accentPrimary}26` : 'transparent', color: character.cultureType === type ? colors.accentSecondary : colors.textPrimary }}
                            >
                              <span>{character.cultureType === type ? '✓' : '○'}</span>
                              <span>{type}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {character.elements.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                    {character.elements.map(el => (
                      <span key={el} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', backgroundColor: `${colors.accentPrimary}26`, border: `1px solid ${colors.accentPrimary}4d`, borderRadius: '20px', fontSize: '12px', color: colors.accentSecondary }}>
                        {el === 'Культура' && character.cultureType ? character.cultureType : el}
                        <span onClick={() => toggleElement(el)} style={{ cursor: 'pointer', opacity: 0.7 }}>✕</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Characteristics */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: colors.accentSecondary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '4px', height: '16px', background: `linear-gradient(180deg, ${colors.accentPrimary}, ${colors.accentSecondary})`, borderRadius: '2px', display: 'inline-block' }}></span>
              ОСНОВНЫЕ ХАРАКТЕРИСТИКИ
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {[
                { label: 'СИЛА (СЛ)', value: character.strength, field: 'strength' as keyof CharacterData },
                { label: 'ЛОВКОСТЬ (ЛВ)', value: character.agility, field: 'agility' as keyof CharacterData },
                { label: 'ИНТЕЛЛЕКТ (ИН)', value: character.intelligence, field: 'intelligence' as keyof CharacterData },
                { label: 'ЗДОРОВЬЕ (ЗД)', value: character.health, field: 'health' as keyof CharacterData },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center', padding: '16px', borderRadius: '12px', backgroundColor: colors.bgSecondary }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>
                    {stat.label}
                  </div>
                  <input
                    type="number"
                    value={stat.value}
                    onChange={(e) => updateField(stat.field, parseInt(e.target.value) || 0)}
                    style={{ fontSize: '28px', fontWeight: 700, color: colors.textPrimary, textAlign: 'center', width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Characteristics */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: colors.accentSecondary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '4px', height: '16px', background: `linear-gradient(180deg, ${colors.accentPrimary}, ${colors.accentSecondary})`, borderRadius: '2px', display: 'inline-block' }}></span>
              ПОБОЧНЫЕ ХАРАКТЕРИСТИКИ
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {/* HP */}
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: colors.bgSecondary }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>ОЧКИ ЗДОРОВЬЯ (ОЗ)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="number" value={character.hpCurrent} onChange={(e) => updateField('hpCurrent', parseInt(e.target.value) || 0)} style={{ width: '70px', padding: '8px', textAlign: 'center', fontSize: '18px', fontWeight: 700, backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.textPrimary, outline: 'none' }} />
                  <span style={{ color: colors.textMuted }}>/</span>
                  <input type="number" value={character.hpMax} onChange={(e) => updateField('hpMax', parseInt(e.target.value) || 0)} style={{ width: '70px', padding: '8px', textAlign: 'center', fontSize: '18px', fontWeight: 700, backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.textPrimary, outline: 'none' }} />
                  <span style={{ fontSize: '12px', color: colors.textMuted, marginLeft: '8px' }}>= СЛ</span>
                </div>
              </div>
              {/* Base Speed */}
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: colors.bgSecondary }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>СКОРОСТЬ (БС)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="number" step={0.25} value={character.baseSpeed} onChange={(e) => updateField('baseSpeed', parseFloat(e.target.value) || 0)} style={{ width: '100px', padding: '8px', textAlign: 'center', fontSize: '18px', fontWeight: 700, backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.textPrimary, outline: 'none' }} />
                  <span style={{ fontSize: '12px', color: colors.textMuted, marginLeft: '8px' }}>= (ЛВ+ЗД)/4</span>
                </div>
              </div>
              {/* Will */}
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: colors.bgSecondary }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>ВОЛЯ (ВЛ)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="number" value={character.will} onChange={(e) => updateField('will', parseInt(e.target.value) || 0)} style={{ width: '70px', padding: '8px', textAlign: 'center', fontSize: '18px', fontWeight: 700, backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.textPrimary, outline: 'none' }} />
                  <span style={{ fontSize: '12px', color: colors.textMuted, marginLeft: '8px' }}>= ИН</span>
                </div>
              </div>
              {/* Perception */}
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: colors.bgSecondary }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>ВОСПРИЯТИЕ (ВП)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="number" value={character.perception} onChange={(e) => updateField('perception', parseInt(e.target.value) || 0)} style={{ width: '70px', padding: '8px', textAlign: 'center', fontSize: '18px', fontWeight: 700, backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.textPrimary, outline: 'none' }} />
                  <span style={{ fontSize: '12px', color: colors.textMuted, marginLeft: '8px' }}>= ИН</span>
                </div>
              </div>
              {/* Fatigue */}
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: colors.bgSecondary }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>УСТАЛОСТЬ (ЕУ)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="number" value={character.fatigueCurrent} onChange={(e) => updateField('fatigueCurrent', parseInt(e.target.value) || 0)} style={{ width: '70px', padding: '8px', textAlign: 'center', fontSize: '18px', fontWeight: 700, backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.textPrimary, outline: 'none' }} />
                  <span style={{ color: colors.textMuted }}>/</span>
                  <input type="number" value={character.fatigueMax} onChange={(e) => updateField('fatigueMax', parseInt(e.target.value) || 0)} style={{ width: '70px', padding: '8px', textAlign: 'center', fontSize: '18px', fontWeight: 700, backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.textPrimary, outline: 'none' }} />
                  <span style={{ fontSize: '12px', color: colors.textMuted, marginLeft: '8px' }}>= ЗД</span>
                </div>
              </div>
              {/* Magic Vessel */}
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: colors.bgSecondary }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>МАГИЧЕСКИЙ СОСУД (МН)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="number" value={character.magicVesselCurrent} onChange={(e) => updateField('magicVesselCurrent', parseInt(e.target.value) || 0)} style={{ width: '70px', padding: '8px', textAlign: 'center', fontSize: '18px', fontWeight: 700, backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.textPrimary, outline: 'none' }} />
                  <span style={{ color: colors.textMuted }}>/</span>
                  <input type="number" value={character.magicVesselMax} onChange={(e) => updateField('magicVesselMax', parseInt(e.target.value) || 0)} style={{ width: '70px', padding: '8px', textAlign: 'center', fontSize: '18px', fontWeight: 700, backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.textPrimary, outline: 'none' }} />
                  <span style={{ fontSize: '12px', color: colors.textMuted, marginLeft: '8px' }}>= ЕУ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Special Section */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: colors.accentSecondary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '4px', height: '16px', background: `linear-gradient(180deg, ${colors.accentPrimary}, ${colors.accentSecondary})`, borderRadius: '2px', display: 'inline-block' }}></span>
              ОСОБОЕ
            </div>
            <p style={{ fontSize: '14px', color: colors.textMuted }}>Дополнительные настройки характеристики</p>
            <div style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', border: `1px dashed ${colors.border}` }}>
              <p style={{ fontSize: '14px', textAlign: 'center', color: colors.textMuted }}>• ДОБАВИТЬ ОСОБОЕ</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px', borderTop: `1px solid ${colors.border}` }}>
        <p style={{ fontSize: '12px', color: colors.textMuted }}>
          DISTORTED MULTIVERSE — IDEAL WORLD © Character Sheet System
        </p>
      </footer>
    </div>
  );
}

export default App;
