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

  // Race management
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

  // Element management
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

  // Image upload
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

  // Save to JSON file
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

  // Load from JSON file
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

  // Save to localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem('dm_character', JSON.stringify(character));
    showNotification('Сохранено в браузере!');
  };

  // Load from localStorage
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

  // Export to TXT
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

  // Export to PNG
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

  // Close dropdowns on outside click
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
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-fade-in"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--accent-primary)',
            borderRadius: '8px',
            padding: '12px 20px',
            color: 'var(--accent-secondary)',
            fontSize: '14px',
            boxShadow: '0 4px 20px var(--accent-glow)',
          }}>
          {notification}
        </div>
      )}

      {/* Header */}
      <header className="dm-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}>
              ✦
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                DISTORTED MULTIVERSE
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)', letterSpacing: '2px' }}>
                IDEAL WORLD — ЛИСТ ПЕРСОНАЖА
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="dm-btn dm-btn-secondary" onClick={saveToLocalStorage}>
              💾 Сохранить
            </button>
            <button className="dm-btn dm-btn-secondary" onClick={loadFromLocalStorage}>
              📂 Загрузить
            </button>
            <button className="dm-btn dm-btn-secondary" onClick={saveToFile}>
              📁 Экспорт JSON
            </button>
            <button className="dm-btn dm-btn-secondary" onClick={() => loadInputRef.current?.click()}>
              📥 Импорт JSON
            </button>
            <button className="dm-btn dm-btn-secondary" onClick={exportToTxt}>
              📄 TXT
            </button>
            <button className="dm-btn dm-btn-primary" onClick={exportToPng}>
              🖼️ PNG
            </button>
            <input ref={loadInputRef} type="file" accept=".json" className="hidden" onChange={loadFromFile} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div ref={sheetRef} style={{ background: 'var(--bg-primary)' }}>
          {/* Character Image + Name Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Character Image */}
            <div className="dm-card flex flex-col items-center justify-center">
              <div className="dm-section-title">АРТЫ ПЕРСОНАЖА</div>
              <div
                className="dm-image-upload w-full aspect-square flex items-center justify-center relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {character.characterImage ? (
                  <img
                    src={character.characterImage}
                    alt="Персонаж"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center p-6">
                    <div className="text-4xl mb-3 opacity-50">🖼️</div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Нет видимых артов
                    </p>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                      Нажмите для загрузки
                    </p>
                  </div>
                )}
                {character.characterImage && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Изменить изображение</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Name */}
              <div className="dm-card">
                <div className="dm-section-title">ГЛАВНОЕ</div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Имя персонажа
                    </label>
                    <input
                      type="text"
                      className="dm-input text-lg font-medium"
                      placeholder="Введите имя..."
                      value={character.name}
                      onChange={(e) => updateField('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Ранг
                    </label>
                    <input
                      type="text"
                      className="dm-input"
                      placeholder="напр.: боец I ранга (5 012 очков)"
                      value={character.rank}
                      onChange={(e) => updateField('rank', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Race */}
              <div className="dm-card">
                <div className="dm-section-title">РАСА</div>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="dm-btn dm-btn-secondary w-full justify-between"
                    onClick={() => setShowRaceDropdown(!showRaceDropdown)}
                  >
                    <span style={{ color: character.races.length > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {character.races.length > 0 ? getRaceDisplay() : '+ ADD GENETIC VARIANT'}
                    </span>
                    <span>▾</span>
                  </button>
                  {showRaceDropdown && (
                    <div className="dm-dropdown-menu">
                      {RACE_OPTIONS.map(race => (
                        <div
                          key={race}
                          className={`dm-dropdown-item ${character.races.includes(race) ? 'selected' : ''}`}
                          onClick={() => {
                            toggleRace(race);
                            if (race !== 'Зверолюд') {
                              setShowRaceDropdown(false);
                            }
                          }}
                        >
                          <span>{character.races.includes(race) ? '✓' : '○'}</span>
                          <span>{race}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Beast sub-options */}
                {character.races.includes('Зверолюд') && (
                  <div className="mt-4 space-y-3 animate-fade-in">
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Тип звероялюда
                      </label>
                      <button
                        className="dm-btn dm-btn-secondary w-full justify-between"
                        onClick={() => setShowBeastDropdown(!showBeastDropdown)}
                      >
                        <span style={{ color: character.beastType ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {character.beastType || 'Выберите тип...'}
                        </span>
                        <span>▾</span>
                      </button>
                      {showBeastDropdown && (
                        <div className="dm-dropdown-menu">
                          {BEAST_TYPES.map(type => (
                            <div
                              key={type}
                              className={`dm-dropdown-item ${character.beastType === type ? 'selected' : ''}`}
                              onClick={() => {
                                updateField('beastType', type);
                                setShowBeastDropdown(false);
                              }}
                            >
                              <span>{character.beastType === type ? '✓' : '○'}</span>
                              <span>{type}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {character.beastType === 'лисья' && (
                      <div className="animate-fade-in">
                        <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                          Количество хвостов
                        </label>
                        <input
                          type="number"
                          className="dm-input"
                          min={1}
                          value={character.foxTails}
                          onChange={(e) => updateField('foxTails', parseInt(e.target.value) || 1)}
                          placeholder="Кол-во хвостов"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Selected races display */}
                {character.races.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {character.races.map(race => (
                      <span key={race} className="dm-tag">
                        {race === 'Зверолюд' ? getRaceDisplay() : race}
                        <span className="dm-tag-remove" onClick={() => toggleRace(race)}>✕</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Elements */}
              <div className="dm-card">
                <div className="dm-section-title">ЭЛЕМЕНТЫ</div>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="dm-btn dm-btn-secondary w-full justify-between"
                    onClick={() => setShowElementDropdown(!showElementDropdown)}
                  >
                    <span style={{ color: character.elements.length > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {character.elements.length > 0 ? `${character.elements.length} выбрано` : '+ ADD ELEMENTAL RESONANCE'}
                    </span>
                    <span>▾</span>
                  </button>
                  {showElementDropdown && (
                    <div className="dm-dropdown-menu">
                      {ELEMENT_OPTIONS.map(element => (
                        <div
                          key={element}
                          className={`dm-dropdown-item ${character.elements.includes(element) ? 'selected' : ''}`}
                          onClick={() => {
                            toggleElement(element);
                            if (element === 'Культура') {
                              setShowCultureDropdown(true);
                            }
                          }}
                        >
                          <span>{character.elements.includes(element) ? '✓' : '○'}</span>
                          <span>{element}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Culture sub-options */}
                {character.elements.includes('Культура') && (
                  <div className="mt-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Тип Культуры
                    </label>
                    <div className="relative">
                      <button
                        className="dm-btn dm-btn-secondary w-full justify-between"
                        onClick={() => setShowCultureDropdown(!showCultureDropdown)}
                      >
                        <span style={{ color: character.cultureType ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {character.cultureType || 'Выберите тип культуры...'}
                        </span>
                        <span>▾</span>
                      </button>
                      {showCultureDropdown && (
                        <div className="dm-dropdown-menu">
                          {CULTURE_TYPES.map(type => (
                            <div
                              key={type}
                              className={`dm-dropdown-item ${character.cultureType === type ? 'selected' : ''}`}
                              onClick={() => {
                                updateField('cultureType', type);
                                setShowCultureDropdown(false);
                              }}
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

                {/* Selected elements display */}
                {character.elements.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {character.elements.map(el => (
                      <span key={el} className="dm-tag">
                        {el === 'Культура' && character.cultureType ? character.cultureType : el}
                        <span className="dm-tag-remove" onClick={() => toggleElement(el)}>✕</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Characteristics */}
          <div className="dm-card mb-8">
            <div className="dm-section-title">ОСНОВНЫЕ ХАРАКТЕРИСТИКИ</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <div className="dm-stat-label mb-2">СИЛА (СЛ)</div>
                <input
                  type="number"
                  className="dm-stat-value text-center bg-transparent border-none outline-none w-full"
                  style={{ color: 'var(--text-primary)' }}
                  value={character.strength}
                  onChange={(e) => updateField('strength', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <div className="dm-stat-label mb-2">ЛОВКОСТЬ (ЛВ)</div>
                <input
                  type="number"
                  className="dm-stat-value text-center bg-transparent border-none outline-none w-full"
                  style={{ color: 'var(--text-primary)' }}
                  value={character.agility}
                  onChange={(e) => updateField('agility', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <div className="dm-stat-label mb-2">ИНТЕЛЛЕКТ (ИН)</div>
                <input
                  type="number"
                  className="dm-stat-value text-center bg-transparent border-none outline-none w-full"
                  style={{ color: 'var(--text-primary)' }}
                  value={character.intelligence}
                  onChange={(e) => updateField('intelligence', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <div className="dm-stat-label mb-2">ЗДОРОВЬЕ (ЗД)</div>
                <input
                  type="number"
                  className="dm-stat-value text-center bg-transparent border-none outline-none w-full"
                  style={{ color: 'var(--text-primary)' }}
                  value={character.health}
                  onChange={(e) => updateField('health', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Secondary Characteristics */}
          <div className="dm-card mb-8">
            <div className="dm-section-title">ПОБОЧНЫЕ ХАРАКТЕРИСТИКИ</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* HP */}
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <div className="dm-stat-label mb-2">ОЧКИ ЗДОРОВЬЯ (ОЗ)</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="dm-input text-center text-lg font-bold"
                    style={{ width: '70px' }}
                    value={character.hpCurrent}
                    onChange={(e) => updateField('hpCurrent', parseInt(e.target.value) || 0)}
                  />
                  <span style={{ color: 'var(--text-muted)' }}>/</span>
                  <input
                    type="number"
                    className="dm-input text-center text-lg font-bold"
                    style={{ width: '70px' }}
                    value={character.hpMax}
                    onChange={(e) => updateField('hpMax', parseInt(e.target.value) || 0)}
                  />
                  <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>= СЛ</span>
                </div>
              </div>

              {/* Base Speed */}
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <div className="dm-stat-label mb-2">СКОРОСТЬ ПЕРЕДВИЖЕНИЯ (БС)</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="dm-input text-center text-lg font-bold"
                    style={{ width: '100px' }}
                    value={character.baseSpeed}
                    step={0.25}
                    onChange={(e) => updateField('baseSpeed', parseFloat(e.target.value) || 0)}
                  />
                  <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>= (ЛВ+ЗД)/4</span>
                </div>
              </div>

              {/* Will */}
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <div className="dm-stat-label mb-2">ВОЛЯ (ВЛ)</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="dm-input text-center text-lg font-bold"
                    style={{ width: '70px' }}
                    value={character.will}
                    onChange={(e) => updateField('will', parseInt(e.target.value) || 0)}
                  />
                  <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>= ИН</span>
                </div>
              </div>

              {/* Perception */}
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <div className="dm-stat-label mb-2">ВОСПРИЯТИЕ (ВП)</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="dm-input text-center text-lg font-bold"
                    style={{ width: '70px' }}
                    value={character.perception}
                    onChange={(e) => updateField('perception', parseInt(e.target.value) || 0)}
                  />
                  <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>= ИН</span>
                </div>
              </div>

              {/* Fatigue */}
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <div className="dm-stat-label mb-2">УСТАЛОСТЬ (ЕУ)</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="dm-input text-center text-lg font-bold"
                    style={{ width: '70px' }}
                    value={character.fatigueCurrent}
                    onChange={(e) => updateField('fatigueCurrent', parseInt(e.target.value) || 0)}
                  />
                  <span style={{ color: 'var(--text-muted)' }}>/</span>
                  <input
                    type="number"
                    className="dm-input text-center text-lg font-bold"
                    style={{ width: '70px' }}
                    value={character.fatigueMax}
                    onChange={(e) => updateField('fatigueMax', parseInt(e.target.value) || 0)}
                  />
                  <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>= ЗД</span>
                </div>
              </div>

              {/* Magic Vessel */}
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <div className="dm-stat-label mb-2">МАГИЧЕСКИЙ СОСУД (МН)</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="dm-input text-center text-lg font-bold"
                    style={{ width: '70px' }}
                    value={character.magicVesselCurrent}
                    onChange={(e) => updateField('magicVesselCurrent', parseInt(e.target.value) || 0)}
                  />
                  <span style={{ color: 'var(--text-muted)' }}>/</span>
                  <input
                    type="number"
                    className="dm-input text-center text-lg font-bold"
                    style={{ width: '70px' }}
                    value={character.magicVesselMax}
                    onChange={(e) => updateField('magicVesselMax', parseInt(e.target.value) || 0)}
                  />
                  <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>= ЕУ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Special Section */}
          <div className="dm-card">
            <div className="dm-section-title">ОСОБОЕ</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Дополнительные настройки характеристики
            </p>
            <div className="mt-4 p-4 rounded-xl border border-dashed" style={{ borderColor: 'var(--border-color)' }}>
              <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                • ДОБАВИТЬ ОСОБОЕ
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6" style={{ borderTop: '1px solid var(--border-color)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          DISTORTED MULTIVERSE — IDEAL WORLD © Character Sheet System
        </p>
      </footer>
    </div>
  );
}

export default App;
