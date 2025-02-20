export async function fetchWeapons() {
    const res = await fetch("http://127.0.0.1:5000/api/weapons");
    return res.json();
  }
  
  export async function fetchCharacters() {
    const res = await fetch("http://127.0.0.1:5000/api/characters");
    return res.json();
  }
  