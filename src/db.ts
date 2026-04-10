import sqlite3 from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const isProd = process.env.NODE_ENV === 'production';
const dbPath = process.env.DB_PATH || (isProd ? path.join('/tmp', 'bharatexplore.db') : path.join(process.cwd(), 'bharatexplore.db'));

// Ensure directory exists if custom path is provided
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3(dbPath);

export function initDb() {
  // Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // States Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      culture TEXT,
      cuisine TEXT,
      image_url TEXT
    )
  `);

  // Places Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      history TEXT,
      best_time TEXT,
      latitude REAL,
      longitude REAL,
      image_url TEXT,
      FOREIGN KEY (state_id) REFERENCES states (id)
    )
  `);

  // Attractions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attractions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      place_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (place_id) REFERENCES places (id)
    )
  `);

  // Favorites Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      place_id INTEGER,
      UNIQUE(user_id, place_id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (place_id) REFERENCES places (id)
    )
  `);

  const stateCount = db.prepare('SELECT COUNT(*) as count FROM states').get() as { count: number };
  
  // If we want to "Add all", we might want to clear or just append. 
  // Given the request, I'll clear and re-seed with a much larger dataset.
  if (stateCount.count < 10) { // If it's just the initial 3, let's re-seed
    db.exec('DELETE FROM attractions');
    db.exec('DELETE FROM favorites');
    db.exec('DELETE FROM places');
    db.exec('DELETE FROM states');

    const insertState = db.prepare('INSERT INTO states (name, description, culture, cuisine, image_url) VALUES (?, ?, ?, ?, ?)');
    const insertPlace = db.prepare('INSERT INTO places (state_id, name, description, history, best_time, latitude, longitude, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const insertAttraction = db.prepare('INSERT INTO attractions (place_id, name, description) VALUES (?, ?, ?)');

    const statesData = [
      {
        name: 'Rajasthan',
        description: 'The Land of Kings, Rajasthan is a vibrant state known for its majestic forts, opulent palaces, and rich history.',
        culture: 'Famous for Ghoomar dance, Kalbelia music, and intricate handicrafts.',
        cuisine: 'Dal Baati Churma, Laal Maas, and Ker Sangri.',
        image_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Jaipur',
            description: 'The Pink City, known for its stunning architecture and bustling bazaars.',
            history: 'Founded in 1727 by Maharaja Sawai Jai Singh II, it was India\'s first planned city.',
            best_time: 'October to March',
            lat: 26.9124, lng: 75.7873,
            image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Hawa Mahal', description: 'The Palace of Winds, a five-story pyramidal shaped monument.' },
              { name: 'Amer Fort', description: 'A majestic fort situated on a hill, known for its artistic Hindu style elements.' }
            ]
          },
          {
            name: 'Udaipur',
            description: 'The City of Lakes, often called the Venice of the East.',
            history: 'Founded in 1553 by Maharana Udai Singh II as the new capital of Mewar kingdom.',
            best_time: 'September to March',
            lat: 24.5854, lng: 73.7125,
            image: 'https://images.unsplash.com/photo-1585128719715-46776b56a0d1?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'City Palace', description: 'A complex of several palaces built over 400 years.' },
              { name: 'Lake Pichola', description: 'An artificial fresh water lake, created in the year 1362 AD.' }
            ]
          }
        ]
      },
      {
        name: 'Kerala',
        description: 'God\'s Own Country, Kerala is a tropical paradise known for its backwaters, palm-lined beaches, and spice plantations.',
        culture: 'Home to Kathakali dance, Mohiniyattam, and the martial art Kalaripayattu.',
        cuisine: 'Sadhya, Appam with Stew, and Malabar Parotta.',
        image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1932&auto=format&fit=crop',
        places: [
          {
            name: 'Munnar',
            description: 'A breathtaking hill station famous for its sprawling tea estates.',
            history: 'Used as a summer resort by the British administration in South India.',
            best_time: 'September to March',
            lat: 10.0889, lng: 77.0595,
            image: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Eravikulam National Park', description: 'Home to the endangered Nilgiri Tahr.' },
              { name: 'Tea Museum', description: 'Showcases the history and evolution of tea plantations in Munnar.' }
            ]
          },
          {
            name: 'Alleppey',
            description: 'The Venice of the East, famous for its houseboat cruises through serene backwaters.',
            history: 'An ancient port town, it became a major hub for coir and spice trade.',
            best_time: 'November to February',
            lat: 9.4981, lng: 76.3329,
            image: 'https://images.unsplash.com/photo-1593181629936-11c609b8db9b?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Alappuzha Beach', description: 'A popular beach known for its 150-year-old pier.' },
              { name: 'Marari Beach', description: 'A quiet and peaceful beach located near Alleppey.' }
            ]
          }
        ]
      },
      {
        name: 'Maharashtra',
        description: 'A land of diversity, from the bustling metropolis of Mumbai to the ancient caves of Ajanta and Ellora.',
        culture: 'Rich in traditions like Lavani dance and the grand celebration of Ganesh Chaturthi.',
        cuisine: 'Vada Pav, Misal Pav, and Puran Poli.',
        image_url: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=2071&auto=format&fit=crop',
        places: [
          {
            name: 'Mumbai',
            description: 'The City of Dreams, India\'s financial capital and home to Bollywood.',
            history: 'Originally a group of seven islands, it was ceded to the Portuguese and later the British.',
            best_time: 'October to March',
            lat: 19.0760, lng: 72.8777,
            image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=2071&auto=format&fit=crop',
            attractions: [
              { name: 'Gateway of India', description: 'An iconic arch-monument built during the 20th century.' },
              { name: 'Marine Drive', description: 'A 3.6-kilometre-long promenade along the coast.' }
            ]
          },
          {
            name: 'Aurangabad',
            description: 'The tourism capital of Maharashtra, gateway to world-famous caves.',
            history: 'Founded in 1610 by Malik Ambar, it was later renamed by Emperor Aurangzeb.',
            best_time: 'October to March',
            lat: 19.8762, lng: 75.3433,
            image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Ajanta Caves', description: 'Ancient Buddhist rock-cut monuments dating from the 2nd century BCE.' },
              { name: 'Ellora Caves', description: 'A UNESCO World Heritage site featuring Hindu, Buddhist and Jain monuments.' }
            ]
          }
        ]
      },
      {
        name: 'Tamil Nadu',
        description: 'A land of temples, classical arts, and a rich Dravidian heritage.',
        culture: 'Famous for Bharatanatyam dance, Carnatic music, and grand temple festivals.',
        cuisine: 'Idli, Dosa, Sambar, and Chettinad Chicken.',
        image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Chennai',
            description: 'The Gateway to South India, known for its beaches and cultural institutions.',
            history: 'Established as Fort St. George by the British East India Company in 1639.',
            best_time: 'November to February',
            lat: 13.0827, lng: 80.2707,
            image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Marina Beach', description: 'One of the longest urban beaches in the world.' },
              { name: 'Kapaleeshwarar Temple', description: 'A historic temple dedicated to Lord Shiva.' }
            ]
          },
          {
            name: 'Madurai',
            description: 'One of the oldest continuously inhabited cities in the world.',
            history: 'The capital of the Pandyan kings, it has been a major center for Tamil culture.',
            best_time: 'October to March',
            lat: 9.9252, lng: 78.1198,
            image: 'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Meenakshi Amman Temple', description: 'A historic Hindu temple located on the southern bank of the Vaigai River.' },
              { name: 'Thirumalai Nayakkar Mahal', description: 'A 17th-century palace complex.' }
            ]
          }
        ]
      },
      {
        name: 'Uttar Pradesh',
        description: 'The heartland of India, home to the iconic Taj Mahal and sacred cities like Varanasi.',
        culture: 'Rich in classical arts like Kathak dance and the legacy of the Mughal Empire.',
        cuisine: 'Lucknowi Biryani, Kebabs, and Petha.',
        image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eaa0ae?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Agra',
            description: 'Home to the Taj Mahal, one of the Seven Wonders of the World.',
            history: 'The capital of the Mughal Empire under emperors Akbar, Jahangir and Shah Jahan.',
            best_time: 'October to March',
            lat: 27.1767, lng: 78.0081,
            image: 'https://images.unsplash.com/photo-1564507592333-c60657eaa0ae?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Taj Mahal', description: 'An ivory-white marble mausoleum built by Shah Jahan.' },
              { name: 'Agra Fort', description: 'A historical fort that was the main residence of the Mughals.' }
            ]
          },
          {
            name: 'Varanasi',
            description: 'The spiritual capital of India, one of the oldest living cities in the world.',
            history: 'Known as Kashi, it has been a center of learning and civilization for over 3,000 years.',
            best_time: 'October to March',
            lat: 25.3176, lng: 82.9739,
            image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=2076&auto=format&fit=crop',
            attractions: [
              { name: 'Kashi Vishwanath Temple', description: 'One of the most famous Hindu temples dedicated to Lord Shiva.' },
              { name: 'Dashashwamedh Ghat', description: 'The main ghat in Varanasi on the Ganges River.' }
            ]
          }
        ]
      },
      {
        name: 'Karnataka',
        description: 'A state of tech hubs, ancient ruins, and diverse natural beauty.',
        culture: 'Famous for Yakshagana folk theater and classical Carnatic music.',
        cuisine: 'Bisi Bele Bath, Mysore Pak, and Neer Dosa.',
        image_url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Bengaluru',
            description: 'The Silicon Valley of India, known for its parks and nightlife.',
            history: 'Founded by Kempe Gowda I in 1537, it grew under the Mysore Kingdom and British rule.',
            best_time: 'October to February',
            lat: 12.9716, lng: 77.5946,
            image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Lalbagh Botanical Garden', description: 'A historic garden with a glass house inspired by London\'s Crystal Palace.' },
              { name: 'Bangalore Palace', description: 'A palace built in Tudor Revival style architecture.' }
            ]
          },
          {
            name: 'Hampi',
            description: 'A UNESCO World Heritage site featuring the ruins of the Vijayanagara Empire.',
            history: 'The capital of the prosperous Vijayanagara Empire in the 14th century.',
            best_time: 'October to March',
            lat: 15.3350, lng: 76.4600,
            image: 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Virupaksha Temple', description: 'A historic temple dedicated to Lord Shiva, still in active use.' },
              { name: 'Vittala Temple', description: 'Famous for its stone chariot and musical pillars.' }
            ]
          }
        ]
      },
      {
        name: 'West Bengal',
        description: 'A land of literature, arts, and the majestic Sundarbans.',
        culture: 'Known for Rabindra Sangeet, Durga Puja, and a deep love for football.',
        cuisine: 'Machher Jhol (Fish Curry), Rosogolla, and Mishti Doi.',
        image_url: 'https://images.unsplash.com/photo-1558431382-bb7499d5d5bb?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Kolkata',
            description: 'The Cultural Capital of India, known for its colonial architecture.',
            history: 'The capital of British India until 1911, it was a major center for the Indian independence movement.',
            best_time: 'October to March',
            lat: 22.5726, lng: 88.3639,
            image: 'https://images.unsplash.com/photo-1558431382-bb7499d5d5bb?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Victoria Memorial', description: 'A large marble building dedicated to the memory of Queen Victoria.' },
              { name: 'Howrah Bridge', description: 'A massive cantilever bridge over the Hooghly River.' }
            ]
          },
          {
            name: 'Darjeeling',
            description: 'The Queen of the Hills, famous for its tea and views of Kanchenjunga.',
            history: 'Developed as a hill station by the British in the mid-19th century.',
            best_time: 'April to June, October to December',
            lat: 27.0410, lng: 88.2663,
            image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Tiger Hill', description: 'Famous for its panoramic views of Mount Everest and Kanchenjunga.' },
              { name: 'Darjeeling Himalayan Railway', description: 'A UNESCO World Heritage site, also known as the Toy Train.' }
            ]
          }
        ]
      },
      {
        name: 'Gujarat',
        description: 'A state of legends, lions, and the vibrant Rann of Kutch.',
        culture: 'Famous for Garba dance, intricate textiles, and the legacy of Mahatma Gandhi.',
        cuisine: 'Dhokla, Khandvi, and Gujarati Thali.',
        image_url: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=2071&auto=format&fit=crop',
        places: [
          {
            name: 'Ahmedabad',
            description: 'India\'s first UNESCO World Heritage City, known for its heritage and textiles.',
            history: 'Founded in 1411 by Sultan Ahmed Shah, it was a major center for the textile industry.',
            best_time: 'October to March',
            lat: 23.0225, lng: 72.5714,
            image: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=2071&auto=format&fit=crop',
            attractions: [
              { name: 'Sabarmati Ashram', description: 'The residence of Mahatma Gandhi for many years.' },
              { name: 'Adalaj Stepwell', description: 'A unique Hindu water building and a stunning example of Indo-Islamic architecture.' }
            ]
          },
          {
            name: 'Gir National Park',
            description: 'The only natural habitat of the Asiatic Lion.',
            history: 'Established in 1965 to protect the dwindling population of Asiatic lions.',
            best_time: 'December to March',
            lat: 21.1243, lng: 70.8242,
            image: 'https://images.unsplash.com/photo-1548543604-a87a9909abec?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Lion Safari', description: 'A guided tour to spot Asiatic lions in their natural habitat.' },
              { name: 'Kamleshwar Dam', description: 'A scenic dam located within the park.' }
            ]
          }
        ]
      },
      {
        name: 'Himachal Pradesh',
        description: 'The Abode of Snow, a Himalayan paradise for adventure and peace.',
        culture: 'Rich in mountain traditions, folk music like Nati, and colorful festivals.',
        cuisine: 'Dham, Siddu, and Kullu Trout.',
        image_url: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Shimla',
            description: 'The Summer Capital of British India, known for its colonial charm.',
            history: 'Declared the summer capital of British India in 1864.',
            best_time: 'March to June, October to February',
            lat: 31.1048, lng: 77.1734,
            image: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'The Ridge', description: 'A large open space in the heart of Shimla.' },
              { name: 'Jakhu Temple', description: 'An ancient temple dedicated to Lord Hanuman.' }
            ]
          },
          {
            name: 'Manali',
            description: 'A popular resort town for adventure sports and stunning landscapes.',
            history: 'Named after the Sanatan Hindu lawgiver Manu.',
            best_time: 'March to June, October to February',
            lat: 32.2432, lng: 77.1892,
            image: 'https://images.unsplash.com/photo-1605649440419-44fbcad55ca8?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Rohtang Pass', description: 'A high mountain pass on the eastern Pir Panjal Range.' },
              { name: 'Hadimba Devi Temple', description: 'An ancient cave temple dedicated to Hidimbi Devi.' }
            ]
          }
        ]
      },
      {
        name: 'Odisha',
        description: 'The Soul of Incredible India, home to ancient temples and serene beaches.',
        culture: 'Odissi dance and intricate Pattachitra paintings.',
        cuisine: 'Pakhala, Chenna Poda, and Dalma.',
        image_url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1974&auto=format&fit=crop',
        places: [
          {
            name: 'Puri',
            description: 'Famous for the Jagannath Temple and Golden Beach.',
            history: 'One of the Char Dham pilgrimage sites.',
            best_time: 'October to February',
            lat: 19.8135, lng: 85.8312,
            image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1974&auto=format&fit=crop',
            attractions: [
              { name: 'Jagannath Temple', description: 'A major Hindu temple dedicated to Jagannath.' },
              { name: 'Golden Beach', description: 'A Blue Flag certified beach known for its golden sands.' }
            ]
          },
          {
            name: 'Konark',
            description: 'Home to the magnificent Sun Temple, a UNESCO World Heritage site.',
            history: 'Built in the 13th century by King Narasimhadeva I.',
            best_time: 'September to March',
            lat: 19.8876, lng: 86.0945,
            image: 'https://images.unsplash.com/photo-1620393470010-fd63d766786e?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Sun Temple', description: 'A 13th-century Sun Temple designed as a colossal chariot.' },
              { name: 'Chandrabhaga Beach', description: 'A scenic beach located near the Sun Temple.' }
            ]
          }
        ]
      },
      {
        name: 'Punjab',
        description: 'The Land of Five Rivers, known for its fertile soil and brave people.',
        culture: 'Famous for Bhangra and Gidda dance, and the spirit of Sewa (service).',
        cuisine: 'Makki di Roti, Sarson da Saag, and Butter Chicken.',
        image_url: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?q=80&w=1936&auto=format&fit=crop',
        places: [
          {
            name: 'Amritsar',
            description: 'The spiritual and cultural center of the Sikh religion.',
            history: 'Founded in 1577 by Guru Ram Das, the fourth Sikh guru.',
            best_time: 'October to March',
            lat: 31.6340, lng: 74.8723,
            image: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?q=80&w=1936&auto=format&fit=crop',
            attractions: [
              { name: 'Golden Temple', description: 'The holiest Gurdwara of Sikhism.' },
              { name: 'Jallianwala Bagh', description: 'A public garden and memorial of national importance.' }
            ]
          }
        ]
      },
      {
        name: 'Assam',
        description: 'The Gateway to North East India, famous for its tea and wildlife.',
        culture: 'Known for Bihu dance and the unique Assamese silk (Muga).',
        cuisine: 'Masor Tenga (Sour Fish Curry) and Khar.',
        image_url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Kaziranga National Park',
            description: 'A UNESCO World Heritage site and home to the one-horned rhinoceros.',
            history: 'Established as a reserve forest in 1905 to protect the rhinoceros.',
            best_time: 'November to April',
            lat: 26.5775, lng: 93.1711,
            image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Elephant Safari', description: 'A popular way to explore the park and spot wildlife.' },
              { name: 'Orchid Park', description: 'Showcases the diverse flora of the region.' }
            ]
          }
        ]
      },
      {
        name: 'Goa',
        description: 'India\'s smallest state, famous for its beaches, churches, and nightlife.',
        culture: 'A unique blend of Indian and Portuguese cultures.',
        cuisine: 'Fish Curry Rice, Bebinca, and Feni.',
        image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Panaji',
            description: 'The capital city, known for its colonial architecture and river cruises.',
            history: 'Became the capital of Portuguese India in 1843.',
            best_time: 'November to February',
            lat: 15.4909, lng: 73.8278,
            image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Basilica of Bom Jesus', description: 'A UNESCO World Heritage site containing the remains of St. Francis Xavier.' },
              { name: 'Fontainhas', description: 'The Latin Quarter of Panaji, known for its colorful houses.' }
            ]
          }
        ]
      },
      {
        name: 'Madhya Pradesh',
        description: 'The Heart of Incredible India, home to ancient monuments and tiger reserves.',
        culture: 'Famous for tribal arts like Gond painting and classical music festivals.',
        cuisine: 'Poha Jalebi, Bhutte Ka Kees, and Dal Bafla.',
        image_url: 'https://images.unsplash.com/photo-1599933310633-23285cd0dbe7?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Khajuraho',
            description: 'A UNESCO World Heritage site famous for its ornate temples.',
            history: 'Built by the Chandela dynasty between 950 and 1050 AD.',
            best_time: 'October to March',
            lat: 24.8318, lng: 79.9199,
            image: 'https://images.unsplash.com/photo-1599933310633-23285cd0dbe7?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Kandariya Mahadeva Temple', description: 'The largest and most ornate Hindu temple in the Khajuraho group.' },
              { name: 'Light and Sound Show', description: 'Narrates the history of the Chandela dynasty.' }
            ]
          }
        ]
      },
      {
        name: 'Bihar',
        description: 'A land of ancient history, where Buddhism and Jainism originated.',
        culture: 'Famous for Madhubani painting and the celebration of Chhath Puja.',
        cuisine: 'Litti Chokha, Sattu Paratha, and Anarsa.',
        image_url: 'https://images.unsplash.com/photo-1621266451996-81b13f5764a3?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Bodh Gaya',
            description: 'The most important Buddhist pilgrimage site in the world.',
            history: 'The place where Gautama Buddha attained enlightenment under the Bodhi tree.',
            best_time: 'October to March',
            lat: 24.6961, lng: 84.9913,
            image: 'https://images.unsplash.com/photo-1621266451996-81b13f5764a3?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Mahabodhi Temple', description: 'A UNESCO World Heritage site marking the location of Buddha\'s enlightenment.' },
              { name: 'Great Buddha Statue', description: 'An 80-foot tall statue of Buddha in meditation.' }
            ]
          }
        ]
      },
      {
        name: 'Andaman and Nicobar Islands',
        description: 'An archipelago in the Bay of Bengal, known for its pristine beaches and coral reefs.',
        culture: 'A unique mix of indigenous tribal cultures and modern influences.',
        cuisine: 'Seafood, Coconut-based curries, and tropical fruits.',
        image_url: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?q=80&w=1935&auto=format&fit=crop',
        places: [
          {
            name: 'Havelock Island',
            description: 'Famous for Radhanagar Beach, often voted the best beach in Asia.',
            history: 'Named after Henry Havelock, a British general in India.',
            best_time: 'October to May',
            lat: 12.0333, lng: 92.9833,
            image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?q=80&w=1935&auto=format&fit=crop',
            attractions: [
              { name: 'Radhanagar Beach', description: 'A stunning beach with white sand and turquoise water.' },
              { name: 'Elephant Beach', description: 'Known for its coral reefs and water sports.' }
            ]
          }
        ]
      },
      {
        name: 'Lakshadweep',
        description: 'A group of islands in the Laccadive Sea, known for its exotic marine life.',
        culture: 'Influenced by the culture of Kerala and Arab traders.',
        cuisine: 'Tuna-based dishes, coconut milk, and spicy curries.',
        image_url: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=2000&auto=format&fit=crop',
        places: [
          {
            name: 'Agatti Island',
            description: 'The gateway to Lakshadweep, known for its stunning lagoon.',
            history: 'Inhabited for centuries, it was a stop for Arab and European traders.',
            best_time: 'October to mid-May',
            lat: 10.8500, lng: 72.1833,
            image: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=2000&auto=format&fit=crop',
            attractions: [
              { name: 'Agatti Lagoon', description: 'Perfect for snorkeling and glass-bottom boat rides.' },
              { name: 'Bangaram Island', description: 'A nearby uninhabited island known for its beauty.' }
            ]
          }
        ]
      },
      {
        name: 'Uttarakhand',
        description: 'The Land of Gods, home to the Himalayas and sacred rivers.',
        culture: 'Rich in Garhwali and Kumaoni traditions.',
        cuisine: 'Kafuli, Phaanu, and Jhangora ki Kheer.',
        image_url: 'https://images.unsplash.com/photo-1584126307049-701544997405?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Rishikesh',
            description: 'The Yoga Capital of the World, situated on the banks of the Ganges.',
            history: 'An ancient pilgrimage site mentioned in several Hindu scriptures.',
            best_time: 'September to November, March to May',
            lat: 30.0869, lng: 78.2676,
            image: 'https://images.unsplash.com/photo-1584126307049-701544997405?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Laxman Jhula', description: 'An iconic suspension bridge across the Ganges.' },
              { name: 'Triveni Ghat', description: 'The main bathing ghat in Rishikesh.' }
            ]
          }
        ]
      },
      {
        name: 'Sikkim',
        description: 'A Himalayan state known for its biodiversity and Buddhist monasteries.',
        culture: 'A blend of Lepcha, Bhutia, and Nepali cultures.',
        cuisine: 'Momos, Thukpa, and Gundruk.',
        image_url: 'https://images.unsplash.com/photo-1589793413308-448272aa5036?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Gangtok',
            description: 'The capital of Sikkim, offering stunning views of Kanchenjunga.',
            history: 'Rose to prominence as a major stop on the trade route between Tibet and British India.',
            best_time: 'March to May, October to mid-December',
            lat: 27.3314, lng: 88.6138,
            image: 'https://images.unsplash.com/photo-1589793413308-448272aa5036?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Rumtek Monastery', description: 'One of the largest and most significant monasteries in Sikkim.' },
              { name: 'Tsomgo Lake', description: 'A high-altitude glacial lake.' }
            ]
          }
        ]
      },
      {
        name: 'Jammu and Kashmir',
        description: 'Paradise on Earth, known for its stunning valleys and lakes.',
        culture: 'Rich in Sufi traditions and Kashmiri handicrafts.',
        cuisine: 'Wazwan, Rogan Josh, and Kahwa.',
        image_url: 'https://images.unsplash.com/photo-1566833925222-f54f71590dd1?q=80&w=2071&auto=format&fit=crop',
        places: [
          {
            name: 'Srinagar',
            description: 'The summer capital, famous for its houseboats and gardens.',
            history: 'Founded by King Pravarasena II over 2,000 years ago.',
            best_time: 'April to October',
            lat: 34.0837, lng: 74.7973,
            image: 'https://images.unsplash.com/photo-1566833925222-f54f71590dd1?q=80&w=2071&auto=format&fit=crop',
            attractions: [
              { name: 'Dal Lake', description: 'The "Jewel in the crown of Kashmir".' },
              { name: 'Shalimar Bagh', description: 'A Mughal garden built by Emperor Jahangir.' }
            ]
          }
        ]
      },
      {
        name: 'Ladakh',
        description: 'The Land of High Passes, known for its remote beauty and Buddhist culture.',
        culture: 'Deeply influenced by Tibetan Buddhism.',
        cuisine: 'Thukpa, Skyu, and Butter Tea.',
        image_url: 'https://images.unsplash.com/photo-1581791534721-e599df4417f7?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Leh',
            description: 'The capital of Ladakh, a hub for adventure and spirituality.',
            history: 'An important stop on the Silk Road trade route.',
            best_time: 'May to September',
            lat: 34.1526, lng: 77.5771,
            image: 'https://images.unsplash.com/photo-1581791534721-e599df4417f7?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Leh Palace', description: 'A former royal palace overlooking the town of Leh.' },
              { name: 'Shanti Stupa', description: 'A white-domed Buddhist stupa on a hilltop.' }
            ]
          }
        ]
      },
      {
        name: 'Telangana',
        description: 'A state of historic monuments and modern tech hubs.',
        culture: 'A blend of Persian and Telugu influences.',
        cuisine: 'Hyderabadi Biryani, Haleem, and Pachi Pulusu.',
        image_url: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Hyderabad',
            description: 'The City of Pearls, known for its history and food.',
            history: 'Founded in 1591 by Muhammad Quli Qutb Shah.',
            best_time: 'October to March',
            lat: 17.3850, lng: 78.4867,
            image: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Charminar', description: 'An iconic mosque and monument built in 1591.' },
              { name: 'Golconda Fort', description: 'A historic fortress and the capital of the Qutb Shahi dynasty.' }
            ]
          }
        ]
      },
      {
        name: 'Andhra Pradesh',
        description: 'The Rice Bowl of India, known for its temples and coastline.',
        culture: 'Home to Kuchipudi dance and rich literary traditions.',
        cuisine: 'Pulihora, Gongura Pachadi, and Andhra Chicken Curry.',
        image_url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1974&auto=format&fit=crop',
        places: [
          {
            name: 'Tirupati',
            description: 'Home to the famous Venkateswara Temple.',
            history: 'One of the most visited religious sites in the world.',
            best_time: 'September to March',
            lat: 13.6288, lng: 79.4192,
            image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1974&auto=format&fit=crop',
            attractions: [
              { name: 'Venkateswara Temple', description: 'A landmark Vaishnavite temple on the hill town of Tirumala.' },
              { name: 'Silathoranam', description: 'A natural stone arch in the Tirumala Hills.' }
            ]
          }
        ]
      },
      {
        name: 'Arunachal Pradesh',
        description: 'The Land of the Rising Sun, known for its pristine natural beauty.',
        culture: 'Home to numerous indigenous tribes with distinct traditions.',
        cuisine: 'Thukpa, Momos, and Bamboo Shoot dishes.',
        image_url: 'https://images.unsplash.com/photo-1570654639102-bdd95eeece7a?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Tawang',
            description: 'Famous for the Tawang Monastery, the largest in India.',
            history: 'Historically part of Tibet, it became part of India in the 20th century.',
            best_time: 'March to June, September to October',
            lat: 27.5861, lng: 91.8594,
            image: 'https://images.unsplash.com/photo-1570654639102-bdd95eeece7a?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Tawang Monastery', description: 'A majestic Buddhist monastery founded in the 17th century.' },
              { name: 'Sela Pass', description: 'A high-altitude mountain pass.' }
            ]
          }
        ]
      },
      {
        name: 'Meghalaya',
        description: 'The Abode of Clouds, known for its living root bridges and heavy rainfall.',
        culture: 'Home to the Khasi, Jaintia, and Garo tribes.',
        cuisine: 'Jadoh, Doh-Khlieh, and Nakham Bitchi.',
        image_url: 'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?q=80&w=1970&auto=format&fit=crop',
        places: [
          {
            name: 'Shillong',
            description: 'The Scotland of the East, known for its rolling hills.',
            history: 'Served as the capital of composite Assam during the British Raj.',
            best_time: 'September to May',
            lat: 25.5788, lng: 91.8933,
            image: 'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?q=80&w=1970&auto=format&fit=crop',
            attractions: [
              { name: 'Elephant Falls', description: 'A multi-tiered waterfall near Shillong.' },
              { name: 'Shillong Peak', description: 'The highest point in Meghalaya, offering panoramic views.' }
            ]
          }
        ]
      },
      {
        name: 'Manipur',
        description: 'The Jewel of India, known for its classical dance and floating islands.',
        culture: 'Famous for Manipuri dance and the game of Polo.',
        cuisine: 'Eromba, Kangshoi, and Singju.',
        image_url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Imphal',
            description: 'The capital city, home to the Kangla Fort.',
            history: 'The site of the Battle of Imphal during World War II.',
            best_time: 'October to March',
            lat: 24.8170, lng: 93.9368,
            image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Kangla Fort', description: 'The old seat of the Manipur Kingdom.' },
              { name: 'Loktak Lake', description: 'The largest freshwater lake in North East India.' }
            ]
          }
        ]
      },
      {
        name: 'Nagaland',
        description: 'The Land of Festivals, known for its vibrant tribal culture.',
        culture: 'Famous for the Hornbill Festival and diverse Naga tribes.',
        cuisine: 'Smoked Pork with Bamboo Shoot and Axone.',
        image_url: 'https://images.unsplash.com/photo-1626021425431-76495368a5c4?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Kohima',
            description: 'The capital city, known for its history and the War Cemetery.',
            history: 'The site of one of the most significant battles of World War II.',
            best_time: 'October to May',
            lat: 25.6751, lng: 94.1086,
            image: 'https://images.unsplash.com/photo-1626021425431-76495368a5c4?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Kohima War Cemetery', description: 'A memorial dedicated to soldiers of the Allied Forces.' },
              { name: 'Kisama Heritage Village', description: 'The venue for the Hornbill Festival.' }
            ]
          }
        ]
      },
      {
        name: 'Chhattisgarh',
        description: 'A state known for its waterfalls, ancient temples, and tribal heritage.',
        culture: 'Rich in folk traditions like Pandavani and Panthi dance.',
        cuisine: 'Chila, Muthiya, and Bore Basi.',
        image_url: 'https://images.unsplash.com/photo-1627393134316-016f6b571165?q=80&w=2070&auto=format&fit=crop',
        places: [
          {
            name: 'Bastar',
            description: 'A region known for its unique tribal culture and Chitrakote Falls.',
            history: 'An ancient kingdom with a rich history of tribal resistance.',
            best_time: 'October to March',
            lat: 19.0700, lng: 82.0300,
            image: 'https://images.unsplash.com/photo-1627393134316-016f6b571165?q=80&w=2070&auto=format&fit=crop',
            attractions: [
              { name: 'Chitrakote Falls', description: 'Often called the Niagara Falls of India.' },
              { name: 'Danteshwari Temple', description: 'A historic temple dedicated to Goddess Danteshwari.' }
            ]
          }
        ]
      }
    ];

    const seed = db.transaction((statesData) => {
      for (const state of statesData) {
        const stateId = insertState.run(state.name, state.description, state.culture, state.cuisine, state.image_url).lastInsertRowid;
        for (const place of state.places) {
          const placeId = insertPlace.run(stateId, place.name, place.description, place.history, place.best_time, place.lat, place.lng, place.image).lastInsertRowid;
          for (const attraction of place.attractions) {
            insertAttraction.run(placeId, attraction.name, attraction.description);
          }
        }
      }
    });

    seed(statesData);

    // Bootstrap Developer User
    const devEmail = 'saiprasadpatro389@gmail.com';
    const existingDev = db.prepare("SELECT * FROM users WHERE email = ?").get(devEmail);
    if (!existingDev) {
      const hashedPassword = bcrypt.hashSync('password123', 10);
      db.prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)").run('Developer', devEmail, hashedPassword);
      console.log(`Bootstrapped developer user: ${devEmail} with password: password123`);
    }
  }
}

export default db;
