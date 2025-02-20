import Link from 'next/link';

export default function SecondPage() {
  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '200px', backgroundColor: 'grey', padding: '20px' }}>
        <h2>Navigation</h2>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/second">Second Page</Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div style={{ padding: '20px' }}>
        <h1>Hello from the Second Page!</h1>
      </div>
    </div>
  );
}

const WeaponSelectModal = ({ isOpen, onClose, onSelect, weapons }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRarityClick = (rarity: string) => {
    setSelectedRarities((prev) =>
      prev.includes(rarity) ? prev.filter((r) => r !== rarity) : [...prev, rarity]
    );
  };

  const handleResetFilters = () => {
    setSelectedRarities([]);
    setSearchTerm('');
  };

  const filteredWeapons = weapons.filter(weapon => {
    const nameMatch = weapon.name.toLowerCase().includes(searchTerm.toLowerCase());
    const rarityMatch = selectedRarities.length === 0 || selectedRarities.includes(weapon.rarity);
    return nameMatch && rarityMatch;
  });

  // ... existing useEffect and null check ...

  return (
    <div style={{ /* ... existing modal styles ... */ }} ref={modalRef}>
      <button style={{ /* ... existing close button styles ... */ }} onClick={onClose}>X</button>
      <h3>Select a Weapon</h3>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        {/* Search Bar */}
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
        {['A', 'S', 'B'].map(rarity => (
          <img
            key={rarity}
            src={`/images/item_rarity_${rarity.toLowerCase()}.webp`}
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
            marginLeft: '10px',
          }}
          onClick={handleResetFilters}
        >
          <img
            src="/images/croix.png"
            alt="Reset Filters"
            style={{
              width: '20px',
              height: '20px',
              marginRight: '5px',
            }}
          />
          <span style={{ color: 'white' }}>Reset</span>
        </div>
      </div>

      <div style={{ /* ... existing weapons grid styles ... */ }}>
        {/* ... existing weapons mapping ... */}
      </div>
    </div>
  );
};