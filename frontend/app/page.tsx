"use client";
import { useEffect, useState, useRef } from "react";
import Link from 'next/link';
import SkillsContainer from "../src/components/SkillsContainer";



// Base interfaces


interface Props {
  name: string;
  value: number;
}

// Main interfaces
interface Stats {
  Attack: number;
  Crit: number;
  CritDamage: number;
  Defence: number;
  ElementAbnormalPower: number;
  ElementMystery: number;
  HpMax: number;
  AttackGrowth: number;
  PenDelta: number;
  PenRate: number;
  BreakStun?: number;
  DefenceGrowth: number;
  HpGrowth: number;
}

interface Character {
  name: string;
  icon: string;
  image: string;
  rarity: string;
  element: string;
  specialty: string;
  faction: string;
  stats?: Stats;
  phase_1_cinema_art?: string;
  phase_2_cinema_art?: string;
  phase_3_cinema_art?: string;
  ascension?: Ascension[];
  extra_ascension?: ExtraAscension[];
}

interface Weapon {
  name: string;
  icon: string;
  rarity: 'S' | 'A' | 'B';
  type: { name: string };
  levels?: { [key: string]: { rate: number } };
  stars?: { [key: string]: { star_rate: number; rand_rate: number } };
  base_property?: { value: number };
  rand_property?: { name: string; value: number };
}

// Helper interfaces
interface Ascension {
  attack: number;
  defense: number;
  max_hp: number;
  min_level: number;
  max_level: number;
}

interface ExtraAscension {
  max_level: number;
  props: Props[];
}

// Modal Props interfaces
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CharacterSelectModalProps extends ModalProps {
  onSelect: (image: string) => void;
  characters: Character[];
}

interface WeaponSelectModalProps extends ModalProps {
  onSelect: (weapon: Weapon) => void;
  weapons: Weapon[];
  selectedLevel: number;
}

interface CoreSelectModalProps extends ModalProps {
  onSelect: (level: number) => void;
  currentLevel: number;
  characterLevel: number;
}

interface CinemaSelectModalProps extends ModalProps {
  onSelect: (number: number) => void;
}

// Constants
const CORE_LEVEL_REQUIREMENTS = {
  1: 1,  // No Core
  2: 15, // Core A
  3: 25, // Core B
  4: 35, // Core C
  5: 45, // Core D
  6: 55, // Core E
  7: 60, // Core F
} as const;

// Helper functions
const calculateWeaponStats = (weapon: Weapon, level: number) => {
  if (!weapon?.base_property?.value || !weapon?.levels || !weapon?.stars || !weapon?.rand_property) {
    return null;
  }

  const baseAttack = weapon.base_property.value;
  const star = Math.floor((level - 1) / 10);
  const multiplicator = weapon.levels[level.toString()]?.rate / 10000;
  const multiplitor = weapon.stars[star.toString()];

  if (!multiplicator || !multiplitor) {
    return null;
  }

  // Use Math.floor for attack calculation
  const attack = Math.floor((baseAttack * multiplitor.star_rate / 10000) + (baseAttack * multiplicator) + baseAttack);
  const substatsValue = weapon.rand_property.value / 100;
  const substats = Math.round((substatsValue * multiplitor.rand_rate / 10000 + substatsValue) * 100) / 100;

  return {
    attack,
    substatsName: weapon.rand_property.name,
    substatsValue: substats
  };
};

const getHighestAvailableCore = (characterLevel: number) => {
  const entries = Object.entries(CORE_LEVEL_REQUIREMENTS);
  for (let i = entries.length - 1; i >= 0; i--) {
    const [coreLevel, reqLevel] = entries[i];
    if (characterLevel >= reqLevel) {
      return parseInt(coreLevel);
    }
  }
  return 1;
};

const CharacterSelectModal = ({ isOpen, onClose, onSelect, characters }: CharacterSelectModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedFactions, setSelectedFactions] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
  setSearchTerm(event.target.value);
};

const handleElementClick = (element: string) => {
  setSelectedElements((prev) =>
    prev.includes(element) ? prev.filter((e) => e !== element) : [...prev, element]
  );
};

const handleSpecialtyClick = (specialty: string) => {
  setSelectedSpecialties((prev) =>
    prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]
  );
};

const handleFactionClick = (faction: string) => {
  setSelectedFactions((prev) =>
    prev.includes(faction) ? prev.filter((f) => f !== faction) : [...prev, faction]
  );
};

const handleRarityClick = (rarity: string) => {
  setSelectedRarities((prev) =>
    prev.includes(rarity) ? prev.filter((f) => f !== rarity) : [...prev, rarity]
  );
};

  const handleResetFilters = () => {
    setSelectedElements([]);
    setSelectedSpecialties([]);
    setSelectedFactions([]);
    setSelectedRarities([]);
    setSearchTerm('');
  };

  const filteredCharacters = characters.filter(character => {
    const nameMatch = character.name.toLowerCase().includes(searchTerm.toLowerCase());
    const elementMatch = selectedElements.length === 0 || selectedElements.includes(character.element);
    const specialtyMatch = selectedSpecialties.length === 0 || selectedSpecialties.includes(character.specialty);
    const factionMatch = selectedFactions.length === 0 || selectedFactions.includes(character.faction);
    const rarityMatch = selectedRarities.length === 0 || selectedRarities.includes(character.rarity);

    console.log(`Character: ${character.name}, Element: ${character.element}, Specialties: ${character.specialty}, Faction: ${character.faction}, Rarity: ${character.rarity}, selectedElements: ${selectedElements}, selectedSpecialties: ${selectedSpecialties}, selectedFactions: ${selectedFactions}, selectedRarities: ${selectedRarities}, nameMatch: ${nameMatch}, elementMatch: ${elementMatch}, specialtyMatch: ${specialtyMatch}, factionMatch: ${factionMatch}, rarityMatch: ${rarityMatch}`);

    return nameMatch && elementMatch && specialtyMatch && factionMatch && rarityMatch;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#161616',
        padding: '20px',
        zIndex: 1000,
        border: '1px solid black',
        width: '90%',
        maxWidth: '1500px',
        height: '80%',
        maxHeight: '800px',
        overflow: 'auto',
      }}
      ref={modalRef}
    >
      {/* Close Button */}
      <button
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
        }}
        onClick={onClose}
      >
        X
      </button>

      <h3>Select a character</h3>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search characters..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            padding: '8px',
            fontSize: '16px',
            width: '250px',
            backgroundColor: '#7E7F7E',
            marginRight: '30px',
          }}
        />

        {/* Rarity Filter Icons */}
        {['A', 'S'].map(rarity => (
          <img
            key={rarity}
            src={`/images/zzz_rarity_${rarity.toLowerCase()}.png`}
            alt={`${rarity} Rarity`}
            style={{
              width: '40px',
              height: '40px',
              marginLeft: '5px',
              cursor: 'pointer',
              opacity: selectedRarities.includes(rarity) ? 1 : 0.5,
            }}
            onClick={() => handleRarityClick(rarity)}
          />
        ))}

        {/* Separator */}
        <span style={{ color: '#7E7F7E', margin: '0 10px', height: '30px', display: 'inline-block', verticalAlign: 'middle' }}>|</span>

        {/* Element Filter Icons */}
        {['Electric', 'Fire', 'Ice', 'Ether', 'Physical'].map(element => (
          <img
            key={element}
            src={`/images/zzz_element_${element.toLowerCase()}.png`}
            alt={`${element} Icon`}
            style={{
              width: '40px',
              height: '40px',
              marginLeft: '5px',
              cursor: 'pointer',
              opacity: selectedElements.includes(element) ? 1 : 0.5,
            }}
            onClick={() => handleElementClick(element)}
          />
        ))}

        {/* Separator */}
        <span style={{ color: '#7E7F7E', margin: '0 10px', height: '30px', display: 'inline-block', verticalAlign: 'middle' }}>|</span>

        {/* Specialty Filter Icons */}
        {['Stun', 'Attack', 'Support', 'Defense', 'Anomaly'].map(specialty => (
          <img
            key={specialty}
            src={`/images/zzz_weapon_${specialty.toLowerCase()}.png`}
            alt={`${specialty} Icon`}
            style={{
              width: '40px',
              height: '40px',
              marginLeft: '5px',
              cursor: 'pointer',
              opacity: selectedSpecialties.includes(specialty) ? 1 : 0.5, // Changed from 5 to 0.5
            }}
            onClick={() => handleSpecialtyClick(specialty)}
          />
        ))}

        {/* Separator */}
        <span style={{ color: '#7E7F7E', margin: '0 10px', height: '30px', display: 'inline-block', verticalAlign: 'middle' }}>|</span>

        {/* Faction Filter Icons */}
        {getUniqueFactions(characters).map(faction => {
          const imageName = `Faction_${(faction.replace(/ /g, '_'))}_Icon.webp`;
          return (
            <img
              key={faction}
              src={`/images/${imageName}`}
              alt={`${faction} Icon`}
              style={{
                width: '40px',
                height: '40px',
                marginLeft: '5px',
                cursor: 'pointer',
                opacity: selectedFactions.includes(faction) ? 1 : 0.5,
              }}
              onClick={() => handleFactionClick(faction)}
            />
          );
        })}

        {/* Separator */}
        <span style={{ color: '#7E7F7E', margin: '0 10px', height: '30px', display: 'inline-block', verticalAlign: 'middle' }}>|</span>

        {/* Reset Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#444545',
            padding: '5px 10px',
            borderRadius: '5px',
            border: '1px solid white',
            cursor: 'pointer',
            opacity: 1,
          }}
          onClick={handleResetFilters}
        >
          <img
            src={`/images/croix.png`}
            alt="Reset Filters"
            style={{
              width: '20px', // Reduced image size
              height: '20px', // Reduced image size
              marginRight: '5px',
            }}
          />
          <span style={{ color: 'White' }}>Reset</span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        rowGap: '5px',
        columnGap: '5px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingLeft: '39px',
        paddingRight: '10px',
      }}>
        {/* Filtered Characters */}
        {filteredCharacters.map((character, index) => {
          let backgroundColor = '';
          if (character.rarity === 'A') {
            backgroundColor = 'rgba(233, 0, 255, 1)';
          } else if (character.rarity === 'S') {
            backgroundColor = 'rgba(255, 181, 0, 1)';
          }

          return (
            <div
              key={index}
              style={{
                position: 'relative',
                padding: '0px',
                borderRadius: '10px',
                backgroundColor: backgroundColor,
                clipPath: 'polygon(0 0, 30% 100%, 100% 100%, 70% 0%)',
                width: '200px',
                textAlign: 'center',
                marginLeft: '-50px',
              }}
            >
              <img
                src={character.icon}
                alt={`Character ${character.name}`}
                style={{
                  width: '200px',
                  height: '200px',
                  cursor: 'pointer',
                  display: 'block',
                }}
                onClick={() => onSelect(character.icon)}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0px', // Changed from '50%' to '0'
                  transform: 'translateX(0%)', // Changed from 'translateX(-50%)' to 'translateX(0%)'
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '2px 65px',
                  fontSize: '14px',
                  width: '150%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  justifyContent: 'left',
                  alignItems: 'center',
                  textAlign: 'center', // Added to align text to the left
                }}
              >
                <span>{character.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to get unique factions from the characters array
const getUniqueFactions = (characters: Character[]): string[] => {
  const factions = new Set<string>();
  characters.forEach(character => factions.add(character.faction));
  return Array.from(factions);
};

const CinemaSelectModal = ({ isOpen, onClose, onSelect }: CinemaSelectModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const numbers = [0, 1, 2, 3, 4, 5, 6];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#161616',
        padding: '20px',
        zIndex: 1000,
        border: '1px solid black',
        borderRadius: '8px',
      }}
      ref={modalRef}
    >
      <h3 style={{ marginBottom: '20px' }}>Select Cinema Character</h3>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
      }}>
        {numbers.map((num) => (
          <img
            key={num}
            src={`/images/${num}.png`}
            alt={`Character ${num}`}
            style={{
              width: '50px',
              height: '50px',
              cursor: 'pointer',
              padding: '5px',
              border: '1px solid #333',
              borderRadius: '4px',
            }}
            onClick={() => {
              onSelect(num);
              onClose();
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Add new Core Select Modal component
const CoreSelectModal = ({ isOpen, onClose, onSelect, currentLevel, characterLevel }: CoreSelectModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const levels = [
    { label: 'No', value: 1 },
    { label: 'A', value: 2 },
    { label: 'B', value: 3 },
    { label: 'C', value: 4 },
    { label: 'D', value: 5 },
    { label: 'E', value: 6 },
    { label: 'F', value: 7 },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#161616',
        padding: '20px',
        zIndex: 1000,
        border: '1px solid black',
        borderRadius: '8px',
      }}
      ref={modalRef}
    >
      <h3 style={{ marginBottom: '20px' }}>Select Core Level</h3>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
      }}>
        {levels.map(({ label, value }) => {
          const isAvailable = characterLevel >= CORE_LEVEL_REQUIREMENTS[value as keyof typeof CORE_LEVEL_REQUIREMENTS];
          return (
            <div
              key={value}
              style={{
                padding: '10px 20px',
                backgroundColor: currentLevel === value ? '#4A90E2' : '#2A2A2A',
                opacity: isAvailable ? 1 : 0.5,
                borderRadius: '4px',
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                textAlign: 'center',
                position: 'relative',
              }}
              onClick={() => {
                if (isAvailable) {
                  onSelect(value);
                  onClose();
                }
              }}
            >
              {label}
              {!isAvailable && (
                <div style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '10px',
                  whiteSpace: 'nowrap',
                  color: '#ff4444',
                }}>
                  Requires Lv.{CORE_LEVEL_REQUIREMENTS[value as keyof typeof CORE_LEVEL_REQUIREMENTS]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};



export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage1, setSelectedImage1] = useState("/images/agent_selec1.jpg");
  const [selectedCharacterName1, setSelectedCharacterName1] = useState("");
  const [selectedWeapon1, setSelectedWeapon1] = useState<Weapon | null>(null);
  const [selectedWeaponImage1, setSelectedWeaponImage1] = useState("/images/weapon_selector.png");
  const [selectedImage2, setSelectedImage2] = useState("/images/agent_selec2.jpg");
  const [selectedCharacterName2, setSelectedCharacterName2] = useState("");
  const [selectedWeapon2, setSelectedWeapon2] = useState<Weapon | null>(null);
  const [selectedWeaponImage2, setSelectedWeaponImage2] = useState("/images/weapon_selector.png");
  const [selectedImage3, setSelectedImage3] = useState("/images/agent_selec3.jpg");
  const [selectedCharacterName3, setSelectedCharacterName3] = useState("");
  const [selectedWeapon3, setSelectedWeapon3] = useState<Weapon | null>(null);
  const [selectedWeaponImage3, setSelectedWeaponImage3] = useState("/images/weapon_selector.png");
  const [activeSelection, setActiveSelection] = useState(1);
  const [isWeaponModalOpen, setIsWeaponModalOpen] = useState(false);
  const [activeWeaponSelection, setActiveWeaponSelection] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<number>(60);
  const [selectedNumber, setSelectedNumber] = useState(0);
  const [isCinemaModalOpen, setIsCinemaModalOpen] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string>('/images/background.jpg');
  const [bgImageDimensions, setBgImageDimensions] = useState({ width: 0, height: 0 });
  const [backgroundColor, setBackgroundColor] = useState('#161616');
  const [progressBarColor, setProgressBarColor] = useState('#4A90E2');
  const [sidebarColor, setSidebarColor] = useState('rgba(22, 22, 22, 0.3)');
  const [isCoreModalOpen, setIsCoreModalOpen] = useState(false);
  const [coreLevel, setCoreLevel] = useState(7); // Default to 7 (F) instead of 1
  const [selectedWeaponLevel, setSelectedWeaponLevel] = useState<number>(60);

  const openWeaponModal = (selection: number) => {
    setActiveWeaponSelection(selection);
    setIsWeaponModalOpen(true);
  };

  const closeWeaponModal = () => {
    setIsWeaponModalOpen(false);
  };

  useEffect(() => {
    const fetchCharacterIds = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/character_ids');
        if (!response.ok) {
          throw new Error(`Failed to load character IDs: ${response.status}`);
        }

        try {
          const data = await response.json();
          const characterIds = Object.keys(data);

          if (!Array.isArray(characterIds)) {
            throw new Error("Response is not an object with character IDs");
          }

          const fetchCharacters = async () => {
            const charactersData = await Promise.all(
              characterIds.map(async (characterId) => {
                try {
                  const charResponse = await fetch(`http://127.0.0.1:5000/characters/${characterId}`);
                  if (!charResponse.ok) {
                    console.error(`Failed to fetch character ${characterId}: ${charResponse.status}`);
                    return null;
                  }
                  const charData = await charResponse.json();
                  console.log("Fetched character:", charData);
                  console.log("Cinema arts for character:", {
                    name: charData.code_name,
                    phase1: charData.phase_1_cinema_art,
                    phase2: charData.phase_2_cinema_art,
                    phase3: charData.phase_3_cinema_art
                  });
                  return {
                    name: charData.code_name,
                    icon: charData.icon,
                    image: charData.image,
                    rarity: charData.rarity,
                    element: charData.element.name,
                    specialty: charData.specialty.name,
                    faction: charData.faction?.name || '',
                    stats: charData.stats,
                    ascension: charData.ascension,
                    extra_ascension: charData.extra_ascension,
                    phase_1_cinema_art: charData.phase_1_cinema_art,
                    phase_2_cinema_art: charData.phase_2_cinema_art,
                    phase_3_cinema_art: charData.phase_3_cinema_art,
                  };
                } catch (fetchErr) {
                  console.error(`Error fetching character ${characterId}:`, fetchErr);
                  return null;
                }
              })
            );

            setCharacters(charactersData.filter(Boolean) as Character[]);
            console.log("Characters data:", charactersData);
          };

          fetchCharacters();
        } catch (jsonError) {
          console.error("Failed to parse JSON:", jsonError);
          setError(`Failed to parse character IDs: ${jsonError}`);
        }
      } catch (err) {
        setError(`Failed to load character IDs: ${err}`);
        console.error(err);
      }
    };

    const fetchWeaponIds = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/weapon_ids');
        if (!response.ok) {
          throw new Error(`Failed to load weapon IDs: ${response.status}`);
        }

        try {
          const data = await response.json();

          if (!Array.isArray(data)) {
            throw new Error("Response is not an array of weapon objects");
          }

          const weaponIds = data.map((weapon) => weapon.id.toString());

          const fetchWeapons = async () => {
            const weaponsData = await Promise.all(
              weaponIds.map(async (weaponId) => {
                try {
                  const weaponResponse = await fetch(`http://127.0.0.1:5000/weapons/${weaponId}`);
                  if (!weaponResponse.ok) {
                    console.error(`Failed to fetch weapon ${weaponId}: ${weaponResponse.status}`);
                    return null;
                  }
                  const weaponData = await weaponResponse.json();
                  return { 
                    name: weaponData.name, 
                    icon: weaponData.icon, 
                    rarity: weaponData.rarity,
                    type: weaponData.type,
                    levels: weaponData.levels,
                    stars: weaponData.stars,
                    base_property: weaponData.base_property,
                    rand_property: weaponData.rand_property
                  };
                } catch (fetchErr) {
                  console.error(`Error fetching weapon ${weaponId}: ${fetchErr}`);
                  return null;
                }
              })
            );

            setWeapons(weaponsData.filter(Boolean) as Weapon[]);
            console.log("Weapons data:", weaponsData);
          };

          fetchWeapons();
        } catch (jsonError) {
          console.error("Failed to parse JSON:", jsonError);
          setError(`Failed to parse weapon IDs: ${jsonError}`);
        }
      } catch (err) {
        setError(`Failed to load weapon IDs: ${err}`);
        console.error(err);
      }
    };

    fetchCharacterIds();
    fetchWeaponIds();
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = backgroundImage;
    img.onload = () => {
      setBgImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
  }, [backgroundImage]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const openModal = (selection: number) => {
    setActiveSelection(selection);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getDisplayImage = (slot: number, name: string) => {
    if (!name) {
      return `/images/agent_selec${slot}.jpg`;
    }
    const character = characters.find(c => c.name === name);
    if (!character) {
      return `/images/agent_selec${slot}.jpg`;
    }
    return slot === 1 ? character.image : character.icon;
  };

  const setImageForSlot = (slot: number, name: string) => {
    const imageToShow = getDisplayImage(slot, name);
    switch (slot) {
      case 1: setSelectedImage1(imageToShow); break;
      case 2: setSelectedImage2(imageToShow); break;
      case 3: setSelectedImage3(imageToShow); break;
    }
  };

  const handleCharacterSelection = (image: string, targetSlot: number) => {
    const selectedCharacter = characters.find((character) => character.icon === image);
    if (!selectedCharacter) return;
  
    // Find if this character is already selected in another slot
    let existingSlot = null;
    if (selectedCharacter.name === selectedCharacterName1) existingSlot = 1;
    if (selectedCharacter.name === selectedCharacterName2) existingSlot = 2;
    if (selectedCharacter.name === selectedCharacterName3) existingSlot = 3;
  
    if (existingSlot) {
      // Character is already selected somewhere, perform swap
      const swapCharacters = (slot1: number, slot2: number) => {
        const tempName = getNameForSlot(slot1);
        
        // Update slot1 with slot2's character
        setNameForSlot(slot1, getNameForSlot(slot2));
        setImageForSlot(slot1, getNameForSlot(slot2));
  
        // Update slot2 with slot1's character
        setNameForSlot(slot2, tempName);
        setImageForSlot(slot2, tempName);
  
        // Update background if slot 1 is involved
        if (slot1 === 1 || slot2 === 1) {
          // If slot 1 is becoming empty, reset background
          if ((slot1 === 1 && !getNameForSlot(slot2)) || (slot2 === 1 && !tempName)) {
            updateBackground(null, 0);
          } else {
            // Otherwise update with new character
            const char = characters.find(c => c.name === (slot1 === 1 ? getNameForSlot(slot2) : tempName));
            if (char) {
              updateBackground(char, selectedNumber);
            }
          }
        }
      };
  
      swapCharacters(targetSlot, existingSlot);
    } else {
      // New selection
      setNameForSlot(targetSlot, selectedCharacter.name);
      setImageForSlot(targetSlot, selectedCharacter.name);
  
      // Update background when selecting main character
      if (targetSlot === 1) {
        updateBackground(selectedCharacter, selectedNumber);
      }
    }
  
    closeModal();
  };

  const extractDominantColor = (imageSrc: string) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";  // Enable CORS
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      try {
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) return;

        let r = 0, g = 0, b = 0;
        let colorCount = 0;

        // Only consider non-black/dark pixels for color calculation
        for (let i = 0; i < imageData.data.length; i += 4) {
          const isSignificantColor = 
            imageData.data[i] > 30 || // red
            imageData.data[i + 1] > 30 || // green
            imageData.data[i + 2] > 30;  // blue
          
          if (isSignificantColor) {
            r += imageData.data[i];
            g += imageData.data[i + 1];
            b += imageData.data[i + 2];
            colorCount++;
          }
        }

        if (colorCount > 0) {
          // Calculate average of non-dark colors
          r = Math.floor(r / colorCount);
          g = Math.floor(g / colorCount);
          b = Math.floor(b / colorCount);

          // Set background color (darker)
          const darkenFactor = 0.2;
          setBackgroundColor(`rgb(${Math.floor(r * darkenFactor)}, ${Math.floor(g * darkenFactor)}, ${Math.floor(b * darkenFactor)})`);

          // Set progress bar color (brighter)
          const brightenFactor = 1.5;
          setProgressBarColor(`rgb(${Math.min(255, Math.floor(r * brightenFactor))}, ${Math.min(255, Math.floor(g * brightenFactor))}, ${Math.min(255, Math.floor(b * brightenFactor))})`);

          // Set sidebar color (slightly brighter than background)
          const sidebarFactor = 0.4;
          setSidebarColor(`rgba(${Math.floor(r * sidebarFactor)}, ${Math.floor(g * sidebarFactor)}, ${Math.floor(b * sidebarFactor)}, 0.8)`);
        }
      } catch (error) {
        console.error('Error extracting color:', error);
        setBackgroundColor('#161616'); // Fallback color
        setProgressBarColor('#4A90E2');
        setSidebarColor('rgba(22, 22, 22, 0.3)');
      }
    };
    img.onerror = () => {
      console.error('Error loading image for color extraction');
      setBackgroundColor('#161616'); // Fallback color
      setProgressBarColor('#4A90E2');
      setSidebarColor('rgba(22, 22, 22, 0.3)');
    };
  };

  // Add new function to detect and trim empty borders
  const trimEmptyBorders = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (!ctx) {
          resolve(imageSrc); // Fallback to original if canvas context fails
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let minY = canvas.height;
        let maxY = 0;
        let minX = canvas.width;
        let maxX = 0;

        // Scan pixels to find content boundaries
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const alpha = data[((y * canvas.width + x) * 4) + 3];
            if (alpha > 10) { // Consider pixel not empty if alpha > 10
              minY = Math.min(minY, y);
              maxY = Math.max(maxY, y);
              minX = Math.min(minX, x);
              maxX = Math.max(maxX, x);
            }
          }
        }

        // Add small padding
        const padding = 10;
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(canvas.width, maxX + padding);
        maxY = Math.min(canvas.height, maxY + padding);

        // Create new canvas with trimmed dimensions
        const trimmedCanvas = document.createElement('canvas');
        const trimmedCtx = trimmedCanvas.getContext('2d');
        trimmedCanvas.width = maxX - minX;
        trimmedCanvas.height = maxY - minY;

        if (trimmedCtx) {
          trimmedCtx.drawImage(
            img,
            minX, minY, maxX - minX, maxY - minY,
            0, 0, maxX - minX, maxY - minY
          );
          resolve(trimmedCanvas.toDataURL());
        } else {
          resolve(imageSrc); // Fallback to original if trimming fails
        }
      };
      img.onerror = () => resolve(imageSrc); // Fallback to original on error
      img.src = imageSrc;
    });
  };

  // Save the extracted colors from phase 1
  const [savedPhase1Colors, setSavedPhase1Colors] = useState<{
    bg: string,
    progress: string,
    sidebar: string
  } | null>(null);

  // Modify updateBackground to handle colors properly
  const updateBackground = async (character: Character | null, cinemaNumber: number) => {
    if (!character) {
      setBackgroundImage('/images/background.jpg');
      setBackgroundColor('#161616');
      setSidebarColor('rgba(22, 22, 22, 0.3)');
      setProgressBarColor('#4A90E2');
      setSavedPhase1Colors(null);
      return;
    }
    
    let cinemaArt = character.phase_1_cinema_art;
    if (cinemaNumber >= 3 && cinemaNumber <= 5) {
      cinemaArt = character.phase_2_cinema_art;
    } else if (cinemaNumber === 6) {
      cinemaArt = character.phase_3_cinema_art;
    }
    
    if (cinemaArt) {
      try {
        const trimmedImage = await trimEmptyBorders(cinemaArt);
        setBackgroundImage(trimmedImage);
        
        if (cinemaNumber <= 2) {
          // For phase 1, extract and save colors
          extractDominantColor(trimmedImage);
          // Colors will be saved via state updates in extractDominantColor
        } else {
          // For phase 2/3, set background image but keep phase 1 colors
          if (!savedPhase1Colors) {
            // If we don't have saved colors yet, extract them from phase 1
            const phase1Art = character.phase_1_cinema_art;
            if (phase1Art) {
              extractDominantColor(phase1Art);
            }
          }
          // Otherwise, keep using the existing colors
        }
      } catch (error) {
        console.error('Error processing background image:', error);
        setBackgroundImage(cinemaArt);
        setBackgroundColor('#161616');
        setSidebarColor('rgba(22, 22, 22, 0.3)');
        setProgressBarColor('#4A90E2');
      }
    } else {
      setBackgroundImage('/images/background.jpg');
      setBackgroundColor('#161616');
      setSidebarColor('rgba(22, 22, 22, 0.3)');
      setProgressBarColor('#4A90E2');
    }
  };

  // Helper functions
  const getNameForSlot = (slot: number) => {
    switch (slot) {
      case 1: return selectedCharacterName1;
      case 2: return selectedCharacterName2;
      case 3: return selectedCharacterName3;
      default: return "";
    }
  };

  const setNameForSlot = (slot: number, name: string) => {
    switch (slot) {
      case 1: setSelectedCharacterName1(name); break;
      case 2: setSelectedCharacterName2(name); break;
      case 3: setSelectedCharacterName3(name); break;
    }
  };

  // Replace the individual selectImage functions with this unified approach
  const selectImage1 = (image: string) => handleCharacterSelection(image, 1);
  const selectImage2 = (image: string) => handleCharacterSelection(image, 2);
  const selectImage3 = (image: string) => handleCharacterSelection(image, 3);

  const clearSelectedImage1 = () => {
    setSelectedImage1("/images/agent_selec1.jpg");
    setSelectedCharacterName1("");
    updateBackground(null, 0); // Reset background when clearing character
  };

  const clearSelectedImage2 = () => {
    setSelectedImage2("/images/agent_selec2.jpg");
    setSelectedCharacterName2("");
  };

  const clearSelectedImage3 = () => {
    setSelectedImage3("/images/agent_selec3.jpg");
    setSelectedCharacterName3("");
  };

  const renderStats = (characterName: string) => {
    const character = characters.find(c => c.name === characterName);
    if (!character || !character.stats) return null;

    // Get weapon stats if a weapon is selected
    let weaponStats = null;
    if (selectedWeapon1) {
      weaponStats = calculateWeaponStats(selectedWeapon1, selectedWeaponLevel);
    }

    // Calculate pure base stats first (character + level scaling + ascension)
    const baseStats = {
      Attack: character.stats.Attack,
      Defense: character.stats.Defence,
      HP: character.stats.HpMax,
      Impact: character.stats.BreakStun || 0,
      "Anomaly Mastery": character.stats.ElementAbnormalPower,
      "Energy Regen": 1.2, // Base value is always 1.2
    };

    // Add level scaling
    baseStats.Attack += (character.stats.AttackGrowth * (selectedLevel - 1)) / 10_000;
    baseStats.Defense += (character.stats.DefenceGrowth * (selectedLevel - 1)) / 10_000;
    baseStats.HP += (character.stats.HpGrowth * (selectedLevel - 1)) / 10_000;

    // Add ascension bonuses
    if (character.ascension && Array.isArray(character.ascension)) {
      const sortedAscensions = [...character.ascension].sort((a, b) => b.min_level - a.min_level);
      const currentAscension = sortedAscensions.find(tier => selectedLevel > tier.min_level);
      if (currentAscension) {
        baseStats.Attack += currentAscension.attack;
        baseStats.Defense += currentAscension.defense;
        baseStats.HP += currentAscension.max_hp;
      }
    }

    // Add core base stats
    let corePercentageModifiers: { [key: string]: number } = {};
    if (character.extra_ascension && coreLevel > 1) {
      const maxLevelMap: { [key: number]: number } = {
        2: 15, // A
        3: 25, // B
        4: 35, // C
        5: 45, // D
        6: 55, // E
        7: 60, // F
      };

      const targetLevel = maxLevelMap[coreLevel as keyof typeof maxLevelMap];
      if (targetLevel) {
        const extraAscension = character.extra_ascension.find((ea: ExtraAscension) => ea.max_level === targetLevel);
        if (extraAscension) {
          for (const prop of extraAscension.props) {
            if (prop.name === "Base ATK") {
              baseStats.Attack += prop.value;
            } else if (prop.name === "Impact") {
              baseStats.Impact += prop.value;
            } else if (prop.name === "Anomaly Mastery") {
              baseStats["Anomaly Mastery"] += prop.value;
            } else if (prop.name === "Base Energy Regen") {
              baseStats["Energy Regen"] += prop.value / 100;
            } else {
              // Store percentage modifiers for later
              corePercentageModifiers[prop.name] = prop.value;
            }
          }
        }
      }
    }

    // Add weapon base attack if exists
    if (weaponStats) {
      baseStats.Attack += weaponStats.attack;
    }

    // Create final stats object
    const finalStats = {
      ...baseStats,
      "Crit Rate": character.stats.Crit / 100,
      "Crit DMG": character.stats.CritDamage / 100,
      "Pen Flat": character.stats.PenDelta || 0,
      "Pen Ratio": (character.stats.PenRate || 0) / 100,
      "Anomaly Proficiency": character.stats.ElementMystery,
    };

    // Apply core percentage modifiers
    Object.entries(corePercentageModifiers).forEach(([name, value]) => {
      if (name === "CRIT Rate") {
        finalStats["Crit Rate"] += (value as number) / 100;
      } else if (name === "CRIT DMG") {
        finalStats["Crit DMG"] += (value as number) / 100;
      } else if (name === "PEN Ratio") {
        finalStats["Pen Ratio"] += (value as number) / 100;
      } else if (name === "ATK") {
        finalStats.Attack += Math.floor(baseStats.Attack * ((value as number) / 100));
      } else if (name === "HP") {
        finalStats.HP += Math.floor(baseStats.HP * ((value as number) / 100));
      } else if (name === "Defence") {
        finalStats.Defense += Math.floor(baseStats.Defense * ((value as number) / 100));
      } else if (name === "Anomaly Proficiency") {
        // Anomaly Proficiency is a flat value, not a percentage
        finalStats["Anomaly Proficiency"] += value;
      }
    });

    // Apply weapon percentage modifiers last
    if (weaponStats) {
      const substatsName = weaponStats.substatsName;
      const substatsValue = weaponStats.substatsValue;

      if (substatsName === "ATK") {
        finalStats.Attack += Math.floor(baseStats.Attack * (substatsValue / 100));
      } else if (substatsName === "DEF") {
        // Apply DEF% to base Defense
        finalStats.Defense += Math.floor(baseStats.Defense * (substatsValue / 100));
      } else if (substatsName === "HP") {
        // Apply HP% to base HP
        finalStats.HP += Math.floor(baseStats.HP * (substatsValue / 100));
      } else if (substatsName === "Impact") {
        finalStats.Impact += Math.floor(baseStats.Impact * (substatsValue / 100));
      } else if (substatsName === "Anomaly Mastery") {
        finalStats["Anomaly Mastery"] += Math.floor(baseStats["Anomaly Mastery"] * (substatsValue / 100));
      } else if (substatsName === "Energy Regen") {
        // Apply Energy Regen as percentage to base value like other stats
        finalStats["Energy Regen"] += (baseStats["Energy Regen"] * substatsValue / 100);
      } else {
        type StatName = keyof typeof finalStats;
        
        const getStatName = (name: string): StatName => {
          switch (name) {
            case "CRIT Rate": return "Crit Rate";
            case "CRIT DMG": return "Crit DMG";
            case "PEN Ratio": return "Pen Ratio";
            case "Anomaly Proficiency": return "Anomaly Proficiency";
            default: return name as StatName;
          }
        };

        const statName = getStatName(substatsName);

        if (substatsName === "Anomaly Proficiency") {
          finalStats[statName] = (finalStats[statName] || 0) + (substatsValue * 100);
        } else {
          finalStats[statName] = (finalStats[statName] || 0) + substatsValue;
        }
      }
    }


    // Add core bonus additively if it exists (e.g., +0.12 = 1.32)
    if (character.extra_ascension && coreLevel > 1) {
      const maxLevelMap: Record<number, number> = {
        2: 15, // A
        3: 25, // B
        4: 35, // C
        5: 45, // D
        6: 55, // E
        7: 60, // F
      };

      const targetLevel = maxLevelMap[coreLevel];
      if (targetLevel) {
        const extraAscension = character.extra_ascension.find(ea => ea.max_level === targetLevel);
      }
    }

    // Then multiply by weapon substat if it exists (e.g., 1.32 * (1 + 0.3) = 1.716)


    // Set final Energy Regen value with 2 decimal precision

    // Round all values appropriately
    Object.keys(finalStats).forEach(key => {
      const statKey = key as keyof typeof finalStats;
      if (typeof finalStats[statKey] === 'number') {
        if (statKey === "Energy Regen") {
          finalStats[statKey] = Math.round(finalStats[statKey] * 100) / 100;
        } else if (statKey.includes('Rate') || statKey.includes('DMG') || statKey.includes('Ratio')) {
          finalStats[statKey] = Math.round(finalStats[statKey] * 10) / 10;
        } else {
          finalStats[statKey] = Math.floor(finalStats[statKey]);
        }
      }
    });

    // Add core level indicator
    const coreLevelMap: Record<number, string> = {
      1: 'No Core',
      2: 'Core A',
      3: 'Core B',
      4: 'Core C',
      5: 'Core D',
      6: 'Core E',
      7: 'Core F'
    };

    return (
      <div style={{ padding: '20px' }}>
        <h3>Character Stats</h3>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ color: progressBarColor, marginBottom: '10px' }}>
            {coreLevelMap[coreLevel]}
          </div>
          {Object.entries(finalStats).map(([statName, value]) => (
            <div key={statName}>
              {statName}: {
                statName === "Energy Regen" ? 
                  value.toFixed(2) : 
                  typeof value === 'number' && value % 1 !== 0 ? 
                    value.toFixed(1) : 
                    value
              }
              {statName !== 'Anomaly Proficiency' && (statName.includes('Rate') || statName.includes('DMG') || statName.includes('Ratio')) ? '%' : ''}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleCinemaClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent button click
    setIsCinemaModalOpen(true);
  };

  const handleCinemaSelect = (num: number) => {
    setSelectedNumber(num);
    const currentCharacter = characters.find(c => c.name === selectedCharacterName1);
    if (currentCharacter) {
      updateBackground(currentCharacter, num);
    }
    setIsCinemaModalOpen(false);
  };

  // Add handler for core click
  const handleCoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCoreModalOpen(true);
  };

  // Update setCoreLevel to include level check
  const updateCoreLevel = (newLevel: number) => {
    const availableCore = getHighestAvailableCore(selectedLevel);
    if (newLevel > availableCore) {
      setCoreLevel(availableCore);
    } else {
      setCoreLevel(newLevel);
    }
  };

  // Update useEffect to watch for level changes
  useEffect(() => {
    const availableCore = getHighestAvailableCore(selectedLevel);
    if (coreLevel > availableCore) {
      setCoreLevel(availableCore);
    }
  }, [selectedLevel]);

  const renderWeaponStats = (weapon: Weapon) => {
    if (!weapon?.base_property?.value || !weapon?.levels || !weapon?.stars || !weapon?.rand_property) {
      return null;
    }
  
    const stats = calculateWeaponStats(weapon, selectedWeaponLevel);
    if (!stats) return null;
  
    return (
      <div style={{ padding: '20px' }}>
        <h3>Weapon Stats</h3>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div>Attack: {stats.attack}</div>
          <div>{stats.substatsName}: {stats.substatsName === "Anomaly Proficiency" 
            ? Math.round(stats.substatsValue * 100)
            : `${stats.substatsValue}%`
          }</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      display: 'flex',
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: backgroundColor,
      overflow: 'hidden',
    }}>
      {/* Background Image Container */}
      <div style={{
        position: 'fixed',
        top: '-2%',
        left: '-2%',
        right: '-2%',
        bottom: '-2%',
        width: '100%',
        height: '100%',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.15,
        zIndex: 0,
        transform: 'scale(1.06)',
      }} />

      {/* Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        width: '100%',
      }}>
        {/* Sidebar */}
        <div style={{ 
          width: '200px', 
          backgroundColor: sidebarColor,
          padding: '20px',
        }}>
          <h2>Navigation</h2>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/second">Second Page</Link></li>
          </ul>
        </div>

        {/* Main Content Area */}
        <div style={{ padding: '20px', width: '100%' }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '200px 50px 700px 50px 175px 175px',
            gap: '20px',
            position: 'relative',
          }}>
            {/* Stats Section */}
            <div style={{
              gridColumn: '1 / 2',
              backgroundColor: '#161616',
              height: '600px',
              padding: '20px',
            }}>
              {selectedCharacterName1 ? renderStats(selectedCharacterName1) : <h3>Stats</h3>}
            </div>

            {/* Vertical Bar */}
            <div style={{
              gridColumn: '2 / 3',
              backgroundColor: '#7E7F7E',
              width: '1px',
              height: '100%',
              margin: '0 auto',
            }} />

            {/* Agent 1 Container */}
            <div style={{
              gridColumn: '3 / 4',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              marginLeft: '-150px',
              position: 'relative',
            }}>
              {/* Agent 1 Selection */}
              <div style={{
                display: 'flex',
                marginBottom: '20px',
                position: 'relative',
                alignItems: 'flex-start',
                width: '700px',
                height: '600px',
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  width: '700px',
                  height: '100%',
                  position: 'relative',
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      justifyContent: 'center',
                    }}>
                      {/* Clear button moved to left of name */}
                      {selectedCharacterName1 && (
                        <div style={{
                          width: '24px',
                          height: '24px',
                          border: '1px solid white',
                          cursor: 'pointer',
                          marginRight: '10px',
                        }}>
                          <img
                            src={`/images/croix.png`}
                            alt="Clear Selection"
                            style={{
                              width: '20px',
                              height: '20px',
                              position: 'relative',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                            }}
                            onClick={clearSelectedImage1}
                          />
                        </div>
                      )}
                      
                      <p style={{ 
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>
                        {selectedCharacterName1 || "Select an Agent"}
                        {selectedCharacterName1 && (
                          <span style={{ marginLeft: '10px' }}>- Lvl {selectedLevel}</span>
                        )}
                      </p>
                    </div>

                    {selectedCharacterName1 && (
                      <div style={{
                        width: '300px',
                        height: '40px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                      }}>
                        {/* Level markers with labels */}
                        {[
                          { level: 1, offset: 1 },    // Move 1 slightly right
                          { level: 10, offset: 0 },   // Keep 10 at default
                          { level: 20, offset: 0 },   // Keep 20 at default
                          { level: 30, offset: -1 },  // Move 30 slightly left
                          { level: 40, offset: -1 },  // Move 40 more left
                          { level: 50, offset: -1 },  // Move 50 even more left
                          { level: 60, offset: -2 },  // Move 60 furthest left
                        ].map(({ level, offset }, i) => (
                          <div
                            key={i}
                            style={{
                              position: 'absolute',
                              left: `${((level / 60) * 100) + offset}%`,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              transform: 'translateX(-50%)',
                              width: '20px',
                            }}
                          >
                            <div style={{
                              width: '12px',
                              height: '12px',
                              backgroundColor: '#2A2A2A',
                              borderRadius: '50%',
                              border: '2px solid #161616',
                              zIndex: 1,
                            }} />
                            <span style={{
                              fontSize: '12px',
                              color: 'white',
                              marginTop: '4px',
                            }}>
                              {level}
                            </span>
                          </div>
                        ))}
                        
                        {/* Background bar */}
                        <div style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor: '#2A2A2A',
                          borderRadius: '3px',
                          position: 'absolute',
                          top: '5px',
                        }}>
                          {/* Progress bar */}
                          <div style={{
                            position: 'absolute',
                            left: 0,
                            width: `${(selectedLevel / 60) * 100}%`,
                            height: '100%',
                            backgroundColor: progressBarColor, // Use the new dynamic color
                            borderRadius: '3px',
                            transition: 'width 0.1s, background-color 0.3s',
                          }} />
                          {/* Slider input */}
                          <input
                            type="range"
                            min="1"
                            max="60"
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(Number(e.target.value))}
                            style={{
                              width: '100%',
                              height: '20px',
                              position: 'absolute',
                              top: '-7px',
                              appearance: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              zIndex: 2,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button onClick={() => {
                    openModal(1);
                  }} style={{ 
                    background: 'none', 
                    border: 'none', 
                    padding: 0,
                    width: '700px', // Increased from 600px
                    height: '550px', // Reduced from 600px
                    position: 'relative',
                    marginTop: '20px',
                    marginBottom: '0',
                    cursor: 'pointer',
                  }}>
                    <img 
                      src={selectedImage1} 
                      alt="Agent 1" 
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain', // Changed from 'scale-down' to 'contain'
                        objectPosition: 'center center', // Changed to center center
                        maxHeight: '550px', // Reduced from 600px
                        minHeight: '400px',
                      }} 
                    />
                    {selectedCharacterName1 && (
                      <div
                        style={{
                          bottom: '-50px',
                          right: '-80px',
                          width: '150px',
                          height: '150px',
                          cursor: 'pointer',
                          zIndex: 2,
                          position: 'relative', // Added to position the text
                        }}
                        onClick={handleCinemaClick} // Add click handler
                      >
                        <img
                          src="/images/cinema.png"
                          alt="Cinema"
                          style={{
                            width: '100%',
                            height: '100%',
                          }}
                        />
                        <img
                          src={`/images/${selectedNumber}.png`} // Use selectedNumber state
                          alt={`${selectedNumber}`}
                          style={{
                            position: 'absolute',
                            top: '74.2%',
                            left: '45%',
                            transform: 'translate(-50%, -50%)',
                            width: '20px', // Match the previous font size
                            height: '28px',
                            filter: 'blur(0.5px)', // Added blur effect
                          }}
                        />
                      </div>
                    )}
                  </button>
                  {selectedCharacterName1 && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '-180px', // Increased from -80px to accommodate the level bar
                        top: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        zIndex: 2,
                      }}
                    >
                      <div
                        style={{
                          width: '80px',
                          height: '80px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                        onClick={handleCoreClick}
                      >
                        <img
                          src="/images/core.webp"
                          alt="Core"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </div>

                      <div style={{
                        position: 'relative',
                        width: '120px',  // Increased from 80px
                        height: '150px', // Increased from 100px
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}>
                        {/* Background line */}
                        <div style={{
                          position: 'absolute',
                          top: '20px',    // Adjusted from 15px
                          width: '100%',
                          height: '3px',  // Increased from 2px
                          backgroundColor: '#2A2A2A',
                        }} />

                        {/* Level indicators */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                          position: 'relative',
                        }}>
                          {[
                            { level: 1, label: 'No' },
                            { level: 2, label: 'A' },
                            { level: 3, label: 'B' },
                            { level: 4, label: 'C' },
                            { level: 5, label: 'D' },
                            { level: 6, label: 'E' },
                            { level: 7, label: 'F' },
                          ].map(({ level, label }) => {
                            const isAvailable = selectedLevel >= CORE_LEVEL_REQUIREMENTS[level as keyof typeof CORE_LEVEL_REQUIREMENTS];                            return (
                              <div
                                key={level}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '6px',     // Increased from 4px
                                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                                  width: '16px',  // Increased from 12px
                                  opacity: isAvailable ? 1 : 0.5,
                                }}
                                onClick={() => {
                                  if (isAvailable) {
                                    updateCoreLevel(level);
                                  }
                                }}
                              >
                                <div style={{
                                  width: '12px',   // Increased from 8px
                                  height: '12px',  // Increased from 8px
                                  borderRadius: '50%',
                                  backgroundColor: level === coreLevel ? progressBarColor : '#2A2A2A',
                                  border: '2px solid #161616',
                                  marginTop: '12px', // Increased from 10px
                                  zIndex: 1,
                                }} />
                                <span style={{
                                  fontSize: '14px', // Increased from 12px
                                  color: level === coreLevel ? progressBarColor : '#7E7F7E',
                                }}>
                                  {label}
                                </span>
                                {!isAvailable && (
                                  <div style={{
                                    position: 'absolute',
                                    bottom: '-25px', // Adjusted from -20px
                                    fontSize: '11px', // Increased from 10px
                                    whiteSpace: 'nowrap',
                                    color: '#ff4444',
                                  }}>
                                    {CORE_LEVEL_REQUIREMENTS[level as keyof typeof CORE_LEVEL_REQUIREMENTS]}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Vertical Line */}
              <div style={{
                position: 'absolute',
                left: '620px',
                bottom: 0,
                width: '1px',
                top: '46%',
                height: '55%',
                backgroundColor: '#7E7F7E',
              }} />
              <SkillsContainer />
            </div>

            {/* Buffer Agents Section */}
            <div style={{
              gridColumn: '5 / 7',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              position: 'relative',
              marginLeft: '-100px',
            }}>
              {/* Agent 2 Container with WS1 and WS2 */}
              <div style={{ 
                display: 'flex',
                flexDirection: 'row',
                gap: '27px',
                alignItems: 'flex-start',
                marginLeft: '-50px', // Added margin to move WS1 more to the left
              }}>
                {/* WS1 */}
                <div style={{ 
                  width: '120px',
                  height: '200px',
                  marginRight: '20px',
                  marginLeft: '-180px', // Increased from -80px to move further left
                  marginTop: '-20px',  // Added to move up
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingBottom: '20px',
                  position: 'relative', // Added to ensure proper positioning
                  zIndex: 1, // Added to keep it above other elements
                }}>
                  {selectedWeapon1 ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      marginBottom: '10px',
                    }}>
                      <span style={{ 
                        fontSize: '16px', // Increased from 14px
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '140px' // Increased from 120px
                      }}>{selectedWeapon1.name}</span>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '1px solid white',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }} onClick={(e) => {
                        e.stopPropagation(); // Prevent opening modal when clicking clear
                        setSelectedWeapon1(null);
                        setSelectedWeaponImage1("/images/weapon_selector.png");
                      }}>
                        <img
                          src="/images/croix.png"
                          alt="Clear"
                          style={{ width: '12px', height: '12px' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      marginBottom: '10px',
                      fontSize: '16px', // Increased from 14px
                      color: '#7E7F7E',
                      width: '100%',
                      textAlign: 'center',
                      padding: '5px 0',
                    }}>
                      Select a W-Engine
                    </div>
                  )}
                  <div style={{
                    width: '110px', // Increased from 90px
                    height: '110px', // Increased from 90px
                    borderRadius: '50%',
                    backgroundColor: selectedWeapon1 ? 'transparent' : '#0E1118',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }} onClick={() => openWeaponModal(1)}>
                    <img 
                      src={selectedWeaponImage1}
                      alt="Weapon 1"
                      style={{
                        width: selectedWeapon1 ? '105px' : '90px', // Increased both sizes
                        height: selectedWeapon1 ? '105px' : '90px',
                        objectFit: 'contain',
                        transition: 'width 0.2s, height 0.2s',
                      }}
                    />
                  </div>
                </div>

                {/* Vertical Separator 1 */}
                <div style={{
                  width: '1px',
                  height: '165px',
                  backgroundColor: '#7E7F7E',
                  margin: '0 10px',
                }} />

                {/* Agent 2 */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    display: 'flex',
                    marginBottom: '20px',
                    position: 'relative',
                    alignItems: 'center',
                    width: '175px',
                    height: '180px', // Reduced from 200px
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '175px',
                      height: '180px', // Reduced from 200px
                      position: 'relative', // Added for absolute positioning
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        marginBottom: '10px',
                      }}>
                        <p style={{ 
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}>
                          {selectedCharacterName2 || "Select a Buffer"}
                        </p>
                        {/* Clear button moved next to name */}
                        {selectedCharacterName2 && (
                          <div style={{
                            width: '24px',
                            height: '24px',
                            border: '1px solid white',
                            cursor: 'pointer',
                          }}>
                            <img
                              src={`/images/croix.png`}
                              alt="Clear Selection"
                              style={{
                                width: '20px',
                                height: '20px',
                                position: 'relative',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                              }}
                              onClick={clearSelectedImage2}
                            />
                          </div>
                        )}
                      </div>

                      <button onClick={() => {
                        openModal(2);
                      }} style={{ 
                        background: 'none', 
                        border: 'none', 
                        padding: 0,
                        width: '175px',
                        height: '180px', // Reduced from 200px
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        <img 
                          src={selectedImage2} 
                          alt="Agent 2" 
                          style={{ 
                            width: '100%',
                            height: '100%',
                            objectFit: 'scale-down',
                            objectPosition: 'center',
                            maxWidth: '175px',
                            maxHeight: '180px', // Reduced from 200px
                            minHeight: '130px', // Reduced from 150px
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                          }} 
                        />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* WS2 */}
                <div style={{ 
                  width: '100px',
                  height: '180px',
                  marginRight: '20px',
                  marginTop: '-20px', // Added to move up
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end', // Align to bottom
                  paddingBottom: '20px', // Add some padding at bottom
                }}>
                  {selectedWeapon2 ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      marginBottom: '10px', // Space between name and weapon circle
                    }}>
                      <span style={{ 
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '120px'
                      }}>{selectedWeapon2.name}</span>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '1px solid white',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }} onClick={(e) => {
                        e.stopPropagation(); // Prevent opening modal when clicking clear
                        setSelectedWeapon2(null);
                        setSelectedWeaponImage2("/images/weapon_selector.png");
                      }}>
                        <img
                          src="/images/croix.png"
                          alt="Clear"
                          style={{ width: '12px', height: '12px' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      marginBottom: '10px',
                      fontSize: '16px', // Increased from 14px
                      color: '#7E7F7E',
                      width: '100%', // Added width
                      textAlign: 'center', // Center the text
                      padding: '5px 0', // Added padding
                    }}>
                      W-Engine
                    </div>
                  )}
                  <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    backgroundColor: selectedWeapon2 ? 'transparent' : '#0E1118',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }} onClick={() => openWeaponModal(2)}>
                    <img 
                      src={selectedWeaponImage2}
                      alt="Weapon 2"
                      style={{
                        width: selectedWeapon2 ? '85px' : '70px', // Increased default size from 60px to 70px
                        height: selectedWeapon2 ? '85px' : '70px',
                        objectFit: 'contain',
                        transition: 'width 0.2s, height 0.2s',
                      }}
                    />
                  </div>
                </div>

                {/* Vertical Separator 2 */}
                <div style={{
                  width: '1px',
                  height: '165px',
                  backgroundColor: '#7E7F7E',
                  margin: '0 10px',
                }} />

                {/* Agent 3 */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    display: 'flex',
                    marginBottom: '20px',
                    position: 'relative',
                    alignItems: 'center',
                    width: '175px',
                    height: '180px', // Reduced from 200px
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '175px',
                      height: '180px', // Reduced from 200px
                      position: 'relative', // Added for absolute positioning
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        marginBottom: '10px',
                      }}>
                        <p style={{ 
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}>
                          {selectedCharacterName3 || "Select a Buffer"}
                        </p>
                        {/* Clear button moved next to name */}
                        {selectedCharacterName3 && (
                          <div style={{
                            width: '24px',
                            height: '24px',
                            border: '1px solid white',
                            cursor: 'pointer',
                          }}>
                            <img
                              src={`/images/croix.png`}
                              alt="Clear Selection"
                              style={{
                                width: '20px',
                                height: '20px',
                                position: 'relative',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                              }}
                              onClick={clearSelectedImage3}
                            />
                          </div>
                        )}
                      </div>

                      <button onClick={() => {
                        openModal(3);
                      }} style={{ 
                        background: 'none', 
                        border: 'none', 
                        padding: 0,
                        width: '175px',
                        height: '180px', // Reduced from 200px
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        <img 
                          src={selectedImage3} 
                          alt="Agent 3" 
                          style={{ 
                            width: '100%',
                            height: '100%',
                            objectFit: 'scale-down',
                            objectPosition: 'center',
                            maxWidth: '175px',
                            maxHeight: '180px', // Reduced from 200px
                            minHeight: '130px', // Reduced from 150px
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                          }} 
                        />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* WS3 */}
                <div style={{ 
                  width: '100px',
                  height: '180px',
                  marginRight: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end', // Align to bottom
                  paddingBottom: '20px', // Add some padding at bottom
                }}>
                  {selectedWeapon3 ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      marginBottom: '10px', // Space between name and weapon circle
                    }}>
                      <span style={{ 
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '120px'
                      }}>{selectedWeapon3.name}</span>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '1px solid white',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }} onClick={(e) => {
                        e.stopPropagation(); // Prevent opening modal when clicking clear
                        setSelectedWeapon3(null);
                        setSelectedWeaponImage3("/images/weapon_selector.png");
                      }}>
                        <img
                          src="/images/croix.png"
                          alt="Clear"
                          style={{ width: '12px', height: '12px' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      marginBottom: '10px',
                      fontSize: '16px', // Increased from 14px
                      color: '#7E7F7E',
                      width: '100%', // Added width
                      textAlign: 'center', // Center the text
                      padding: '5px 0', // Added padding
                    }}>
                      W-Engine
                    </div>
                  )}
                  <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    backgroundColor: selectedWeapon3 ? 'transparent' : '#0E1118',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }} onClick={() => openWeaponModal(3)}>
                    <img 
                      src={selectedWeaponImage3}
                      alt="Weapon 3"
                      style={{
                        width: selectedWeapon3 ? '85px' : '70px', // Increased default size from 60px to 70px
                        height: selectedWeapon3 ? '85px' : '70px',
                        objectFit: 'contain',
                        transition: 'width 0.2s, height 0.2s',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Horizontal Lines - Extended further right */}
              <div style={{
                position: 'absolute',
                left: '-220px',
                right: '-266px', // Extended further right (from -100px to -200px)
                top: '185px',
                height: '2px',
                backgroundColor: '#7E7F7E',
              }} />
              <div style={{
                position: 'absolute',
                left: '-220px',
                right: '-266px', // Extended further right (from -100px to -200px)
                top: '285px',
                height: '2px',
                backgroundColor: '#7E7F7E',
              }} />
            </div>
          </div>

          <CharacterSelectModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSelect={(image) => {
              if (activeSelection === 1) {
                selectImage1(image);
              } else if (activeSelection === 2) {
                selectImage2(image);
              } else if (activeSelection === 3) {
                selectImage3(image);
              }
            }}
            characters={characters}
          />
          <WeaponSelectModal
            isOpen={isWeaponModalOpen}
            onClose={closeWeaponModal}
            onSelect={(weapon) => {
              if (activeWeaponSelection === 1) {
                setSelectedWeapon1(weapon);
                setSelectedWeaponImage1(weapon.icon);
              } else if (activeWeaponSelection === 2) {
                setSelectedWeapon2(weapon);
                setSelectedWeaponImage2(weapon.icon);
              } else if (activeWeaponSelection === 3) {
                setSelectedWeapon3(weapon);
                setSelectedWeaponImage3(weapon.icon);
              }
              closeWeaponModal();
            }}
            weapons={weapons}
            selectedLevel={selectedLevel} // Add this line
          />
          <CinemaSelectModal
            isOpen={isCinemaModalOpen}
            onClose={() => setIsCinemaModalOpen(false)}
            onSelect={handleCinemaSelect}
          />
          <CoreSelectModal
            isOpen={isCoreModalOpen}
            onClose={() => setIsCoreModalOpen(false)}
            onSelect={updateCoreLevel}
            currentLevel={coreLevel}
            characterLevel={selectedLevel}
          />
        </div>
        {selectedWeapon1 && (
          <div style={{
            position: 'fixed',
            left: '220px',
            bottom: '20px',
            backgroundColor: '#161616',
            padding: '15px',
            borderRadius: '8px',
            zIndex: 10,
            minWidth: '200px',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                marginBottom: '10px',
                color: progressBarColor
              }}>
                {selectedWeapon1.name} - Lv.{selectedWeaponLevel}
              </div>

              {/* Add weapon level slider back */}
              <div style={{
                width: '100%',
                height: '40px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
              }}>
                {/* Level markers */}
                {[1, 10, 20, 30, 40, 50, 60].map((level, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${(level / 60) * 100}%`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transform: 'translateX(-50%)',
                      width: '20px',
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#2A2A2A',
                      borderRadius: '50%',
                      border: '2px solid #161616',
                      zIndex: 1,
                    }} />
                    <span style={{
                      fontSize: '10px',
                      color: 'white',
                      marginTop: '4px',
                    }}>
                      {level}
                    </span>
                  </div>
                ))}
                
                {/* Background bar */}
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: '#2A2A2A',
                  borderRadius: '2px',
                  position: 'absolute',
                  top: '5px',
                }}>
                  {/* Progress bar */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    width: `${(selectedWeaponLevel / 60) * 100}%`,
                    height: '100%',
                    backgroundColor: progressBarColor,
                    borderRadius: '2px',
                    transition: 'width 0.1s',
                  }} />
                  {/* Slider input */}
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={selectedWeaponLevel}
                    onChange={(e) => setSelectedWeaponLevel(Number(e.target.value))}
                    style={{
                      width: '100%',
                      height: '20px',
                      position: 'absolute',
                      top: '-7px',
                      appearance: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      zIndex: 2,
                    }}
                  />
                </div>
              </div>

              {/* Weapon stats display */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                borderBottom: '1px solid #333',
                paddingBottom: '5px'
              }}>
                <span>Attack:</span>
                <span>{(() => {
                  if (
                    !selectedWeapon1 ||
                    !selectedWeapon1.base_property?.value ||
                    !selectedWeapon1.levels ||
                    !selectedWeapon1.stars
                  ) {
                    return '-';
                  }
                  
                  const baseAttack = selectedWeapon1.base_property.value;
                  const star = Math.floor((selectedWeaponLevel - 1) / 10);
                  const multiplicator = selectedWeapon1?.levels?.[selectedWeaponLevel.toString()]?.rate / 10000 || 0;
                  const multiplitor = selectedWeapon1?.stars?.[star.toString()]?.star_rate / 10000 || 0;
                  
                  const attack = Math.floor((baseAttack * multiplitor) + (baseAttack * multiplicator) + baseAttack);
                  return attack;
                })()}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                borderBottom: '1px solid #333',
                paddingBottom: '5px'
              }}>
                <span>{selectedWeapon1.rand_property?.name || '-'}:</span>
                <span>{(() => {
                  if (
                    !selectedWeapon1 ||
                    !selectedWeapon1.rand_property?.value ||
                    !selectedWeapon1.stars
                  ) {
                    return '-';
                  }
                  const baseValue = selectedWeapon1.rand_property.value / 100;
                  const star = Math.floor((selectedWeaponLevel - 1) / 10);
                  const multiplitor = selectedWeapon1?.stars?.[star.toString()]?.rand_rate / 10000 || 0;
                  
                  const finalValue = Math.round((baseValue * multiplitor + baseValue) * 100) / 100;
                  // Check if it's Anomaly Proficiency to handle display differently
                  if (selectedWeapon1.rand_property.name === "Anomaly Proficiency") {
                    return Math.round(finalValue * 100);
                  }
                  return `${finalValue}%`;
                })()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const WeaponSelectModal = ({ isOpen, onClose, onSelect, weapons, selectedLevel }: WeaponSelectModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSearch = (event : React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleRarityClick = (rarity : string) => {
    setSelectedRarities((prev) =>
      prev.includes(rarity) ? prev.filter((r) => r !== rarity) : [...prev, rarity]
    );
  };

  const handleTypeClick = (type : string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleResetFilters = () => {
    setSelectedRarities([]);
    setSelectedTypes([]);
    setSearchTerm('');
  };

  // Filter and sort weapons
  
  const filteredWeapons = weapons
    .filter(weapon => {
      const nameMatch = weapon.name.toLowerCase().includes(searchTerm.toLowerCase());
      const rarityMatch = selectedRarities.length === 0 || selectedRarities.includes(weapon.rarity);
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(weapon.type.name);
      return nameMatch && rarityMatch && typeMatch;
    })
    .sort((a, b) => {
      const rarityOrder = { 'S': 0, 'A': 1, 'B': 2 };
      return (rarityOrder[a.rarity] ?? 999) - (rarityOrder[b.rarity] ?? 999);
    });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#161616',
        padding: '20px',
        zIndex: 1000,
        border: '1px solid black',
        width: '90%',
        maxWidth: '1500px',
        height: '80%',
        maxHeight: '800px',
        overflow: 'auto',
      }}
      ref={modalRef}
    >
      <button style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }} onClick={onClose}>X</button>
      <h3>Select a Weapon</h3>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        {/* Search and filter controls */}
        <input
          type="text"
          placeholder="Search weapons..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            padding: '8px',
            fontSize: '16px',
            width: '250px',
            backgroundColor: '#7E7F7E',
            marginRight: '30px',
          }}
        />

        {/* Rarity Filter Icons */}
        {['S', 'A', 'B'].map(rarity => (
          <img
            key={rarity}
            src={`/images/item_rarity_${rarity.toLowerCase()}.png`}
            alt={`${rarity} Rarity`}
            style={{
              width: '40px',
              height: '40px',
              marginLeft: '5px',
              cursor: 'pointer',
              opacity: selectedRarities.includes(rarity) ? 1 : 0.5,
            }}
            onClick={() => handleRarityClick(rarity)}
          />
        ))}

        {/* Separator */}
        <span style={{ color: '#7E7F7E', margin: '0 10px', height: '30px', display: 'inline-block', verticalAlign: 'middle' }}>|</span>

        {/* Weapon Type Filter Icons */}
        {['Stun', 'Attack', 'Support', 'Defense', 'Anomaly'].map(type => (
          <img
            key={type}
            src={`/images/zzz_weapon_${type.toLowerCase()}.png`}
            alt={`${type} Type`}
            style={{
              width: '40px',
              height: '40px',
              marginLeft: '5px',
              cursor: 'pointer',
              opacity: selectedTypes.includes(type) ? 1 : 0.5,
            }}
            onClick={() => handleTypeClick(type)}
          />
        ))}

        {/* Separator */}
        <span style={{ color: '#7E7F7E', margin: '0 10px', height: '30px', display: 'inline-block', verticalAlign: 'middle' }}>|</span>

        {/* Reset Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#444545',
            padding: '5px 10px',
            borderRadius: '5px',
            border: '1px solid white',
            cursor: 'pointer',
            opacity: 1,
          }}
          onClick={handleResetFilters}
        >
          <img
            src={`/images/croix.png`}
            alt="Reset Filters"
            style={{
              width: '20px', // Reduced image size
              height: '20px', // Reduced image size
              marginRight: '5px',
            }}
          />
          <span style={{ color: 'White' }}>Reset</span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        rowGap: '5px',
        columnGap: '5px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingLeft: '39px',
        paddingRight: '10px',
      }}>
        {filteredWeapons.map((weapon: Weapon, index) => {
          let backgroundColor = '';
          switch (weapon.rarity) {
            case 'B': backgroundColor = '#0040F2'; break;
            case 'A': backgroundColor = '#D400F4'; break;
            case 'S': backgroundColor = '#F3B000'; break;
          }

          const stats = calculateWeaponStats(weapon, selectedLevel);

          return (
            <div
              key={index}
              style={{
                position: 'relative',
                padding: '0px',
                borderRadius: '10px',
                width: '200px',
                textAlign: 'center',
                marginLeft: '0px',
              }}
            >
              <img
                src={weapon.icon}
                alt={`Weapon ${weapon.name}`}
                style={{
                  width: '200px',
                  height: '200px',
                  cursor: 'pointer',
                  display: 'block',
                }}
                onClick={() => onSelect(weapon)}
              />
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '2px 20px',
                fontSize: '14px',
                width: 'auto',
                minWidth: '120px',
                maxWidth: '180px',
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '4px',
                background: `${backgroundColor}80`,
              }}>
                <span style={{ color: 'white', opacity: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {weapon.name}
                </span>
              </div>
              {stats && (
                <div style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  padding: '5px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}>
                  <div>ATK: {stats.attack}</div>
                  <div>{stats.substatsName}: {
                    stats.substatsName === "Anomaly Proficiency" 
                      ? Math.round(stats.substatsValue * 100)
                      : `${stats.substatsValue}%`
                  }</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};