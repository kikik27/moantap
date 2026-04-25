const ANIMALS = [
  'Kucing', 'Beriang', 'Ayam', 'Gajah', 'Kuda',
  'Monyet', 'Kelinci', 'Panda', 'Sapi', 'Kambing',
  'Ikan', 'Burung', 'Kura', 'Ular', 'Bebek',
  'Siput', 'Kupu', 'Lumba', 'Badak', 'Komodo',
  'Murai', 'Elang', 'Trenggiling', 'Rajawali', 'Cendrawasih',
]

const WORDS = [
  'Tidur', 'Terbang', 'Makan', 'Lompat', 'Malas',
  'Lari', 'Gelut', 'Nyanyi', 'Joget', 'Ketawa',
  'Pusing', 'Santai', 'Galau', 'Rebahan', 'Megik',
  'Ngoding', 'Main', 'Tapa', 'Kalem', 'Gemes',
  'Omas', 'Alay', 'Gabut', 'Sembunyi', 'Jingkrak',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateUsername(): string {
  const animal = pick(ANIMALS)
  const word = pick(WORDS)
  const digits = Math.floor(Math.random() * 900) + 100
  return `${animal}${word}${digits}`
}
