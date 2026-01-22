import { Property, TeamMember, BlogPost, Testimonial, Service } from './types';

export const COMPANY_INFO = {
  name: "Provision Land & Properties Ltd",
  phone: "+254 797 331 355",
  email: "info@provisionlands.co.ke", // Updated from flyer
  secondaryEmail: "provision254@gmail.com",
  address: "Clairbourn Towers, 5th Fl, Thika, Kenya", // Updated from flyer
  slogan: "We Promise and Deliver Genuinely",
  facebook: "https://web.facebook.com/p/Provision-Land-Properties-Ltd-61551485047029/?_rdc=1&_rdr#",
  twitter: "/", // Redirects to homepage
  instagram: "https://www.instagram.com/provision_land_properties_ltd/",
  linkedin: "/", // Redirects to homepage
  // Google Maps location
  googleMapsUrl: "https://www.google.com/maps/place/Provision+Land+%26+Properties+Ltd/@-1.035323,37.074561,17z/data=!3m1!4b1!4m6!3m5!1s0x182f4f0058accd97:0x2760e84f8974afbe!8m2!3d-1.035323!4d37.074561!16s%2Fg%2F11vylj2svd",
  googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.166837891!2d37.074561!3d-1.035323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f4f0058accd97%3A0x2760e84f8974afbe!2sProvision%20Land%20%26%20Properties%20Ltd!5e0!3m2!1sen!2ske!4v1",
  coordinates: { lat: -1.035323, lng: 37.074561 }
};

export const SERVICES: Service[] = [
  {
    id: 's1',
    title: 'Land Sales',
    description: 'Prime plots in high-growth areas like Thika, Murang’a, and Machakos with ready title deeds.',
    icon: 'MapPin'
  },
  {
    id: 's2',
    title: 'Property Valuation',
    description: 'Accurate and professional land and building valuation services.',
    icon: 'TrendingUp'
  },
  {
    id: 's3',
    title: 'Real Estate Management',
    description: 'Comprehensive property management solutions to maximize your returns.',
    icon: 'Home'
  },
  {
    id: 's4',
    title: 'Consultancy',
    description: 'Expert advice on land banking, agribusiness, and residential development.',
    icon: 'Briefcase'
  }
];

// Data structure mirroring a Supabase "properties" table response
export const PROPERTIES: Property[] = [
  {
    id: 'p1',
    title: 'Prime ½ Acre in Kiharu',
    price: 1800000,
    location: 'Kigetuini Village, Murang’a',
    type: 'Land',
    size: '0.5 Acre',
    description: 'A prime and spacious parcel ideal for residential development, farming, or future investment. Located near the shopping center with beautiful neighborhood and easy access.',
    image: '/Prime half Acre in Kiharu.webp',
    images: ['/Prime half Acre in Kiharu.webp'],
    features: ['Near Shopping Center', 'Water Available', 'Electricity', 'Fertile Soil'],
    status: 'For Sale'
  },
  {
    id: 'p2',
    title: '1 Acre at Mang’u',
    price: 5000000,
    location: 'Mang’u, Thika',
    type: 'Land',
    size: '1 Acre',
    description: 'Ideal for building, farming, or residential development. Only 10 minutes drive from Thika town (50 bob fare). A rare lifetime opportunity in a developed area.',
    image: "/1 Acre at Mang'u.webp",
    images: ["/1 Acre at Mang'u.webp"],
    features: ['10 Mins from Thika', 'All Documents Available', 'Residential/Farming'],
    status: 'For Sale'
  },
  {
    id: 'p3',
    title: 'Sagana Makutano Plots',
    price: 650000,
    location: 'Sagana Makutano',
    type: 'Land',
    size: '50x100 ft',
    description: 'Genuine plots just 10 minutes from Makutano Junction. Near Kamweli Shopping Centre and schools. Beaconed with 9-meter wide access roads.',
    image: '/Sagana Makutano Plots.webp',
    images: ['/Sagana Makutano Plots.webp'],
    features: ['Ready Title Deeds', 'Water & Electricity', 'Fully Fenced', 'Gated'],
    status: 'For Sale'
  },
  {
    id: 'p4',
    title: 'Ithanga Murang’a Plots',
    price: 700000,
    location: 'Ithanga, Murang’a',
    type: 'Land',
    size: '50x100 ft',
    description: 'Affordable plots in Ithanga-Maragua, only 30 minutes from Thika. Ideal for home and farming. Ready title deeds.',
    image: "/Ithanga Murang'a Plots.webp",
    images: ["/Ithanga Murang'a Plots.webp"],
    features: ['30 mins from Thika', 'Ready Titles', 'Agribusiness Ready'],
    status: 'For Sale'
  },
  {
    id: 'p5',
    title: 'Kilimambogo / Oldonyo Sabuk',
    price: 600000,
    location: 'Kilimambogo',
    type: 'Land',
    size: '50x100 ft',
    description: 'Scenic plots near Oldonyo Sabuk national park area. Perfect for speculation or settlement.',
    image: '/Kilimambogo Oldonyo Sabuk.webp',
    images: ['/Kilimambogo Oldonyo Sabuk.webp'],
    features: ['Scenic View', 'Developing Area', 'Ready Titles'],
    status: 'For Sale'
  },
  {
    id: 'p6',
    title: 'Tola Ngoingwa',
    price: 2300000,
    location: 'Tola, Thika',
    type: 'Residential',
    size: '50x100 ft',
    description: 'Premium residential plots in Tola Ngoingwa estate. High-end neighborhood.',
    image: '/Tola Ngoingwa.webp',
    images: ['/Tola Ngoingwa.webp'],
    features: ['Gated Community', 'Electricity', 'Water', 'Security'],
    status: 'For Sale'
  },
  {
    id: 'p7',
    title: 'Muguga / Gatuanyaga',
    price: 1800000,
    location: 'Gatuanyaga, Thika',
    type: 'Land',
    size: '50x100 ft',
    description: 'Strategic plots in Gatuanyaga area near Thika. High appreciation potential.',
    image: '/Muguga  Gatuanyaga.webp',
    images: ['/Muguga  Gatuanyaga.webp'],
    features: ['Near Tarmac', 'Electricity', 'Ready for Settlement'],
    status: 'For Sale'
  },
  {
    id: 'p8',
    title: 'Makuyu Mananja Acre',
    price: 2500000,
    location: 'Makuyu Mananja',
    type: 'Land',
    size: '1 Acre',
    description: 'Large 1-acre block in Makuyu. Perfect for large scale farming or subdivision.',
    image: '/Makuyu Mananja Acre.webp',
    images: ['/Makuyu Mananja Acre.webp'],
    features: ['Red Soil', 'Access Roads', 'Water'],
    status: 'For Sale'
  },
  {
    id: 'p9',
    title: 'Matuu Plots',
    price: 280000,
    location: 'Matuu',
    type: 'Land',
    size: '50x100 ft',
    description: 'Very affordable investment plots in Matuu. Get started with land banking today.',
    image: '/Matuu Plots.webp',
    images: ['/Matuu Plots.webp'],
    features: ['Affordable', 'Growing Town', 'Ready Titles'],
    status: 'For Sale'
  },
  {
    id: 'p10',
    title: 'Landless Thika',
    price: 2500000,
    location: 'Landless, Thika',
    type: 'Residential',
    size: '85x100 ft',
    description: 'Prime residential plot in Landless Thika. Larger size (85x100).',
    image: '/Landless Thika.webp',
    images: ['/Landless Thika.webp'],
    features: ['Large Size', 'developed Area', 'Water & Power'],
    status: 'For Sale'
  },
  {
    id: 'p11',
    title: 'Thika Town Commercial',
    price: 7500000,
    location: 'Thika Town',
    type: 'Commercial',
    size: 'Plot',
    description: 'Prime commercial plot next to TIBS College. Ideal for hostels or commercial building.',
    image: '/Thika Town Commercial.webp',
    images: ['/Thika Town Commercial.webp'],
    features: ['CBD Location', 'Commercial Use', 'High Footfall'],
    status: 'For Sale'
  },
  {
    id: 'p12',
    title: 'Mwingi Acre',
    price: 200000,
    location: 'Mwingi',
    type: 'Land',
    size: '1 Acre',
    description: 'Incredibly affordable 1 acre land in Mwingi. Best for long term banking.',
    image: '/Mwingi Acre.webp',
    images: ['/Mwingi Acre.webp'],
    features: ['Low Cost', 'Large Size', 'Investment'],
    status: 'For Sale'
  }
];

// ... (keep TEAM, BLOG_POSTS, TESTIMONIALS as is)
// Re-export other constants to avoid breaking changes if file was replaced completely
export const TEAM: TeamMember[] = [
  {
    id: 't1',
    name: "Stephen Ndung'u",
    role: 'CEO & Founder',
    bio: 'Leading Provision Land & Properties Ltd with a promise to deliver genuinely.',
    image: "/Stephen Ndung'u.webp"
  },
  {
    id: 't2',
    name: 'Sales Team',
    role: 'Customer Relations',
    bio: 'Our dedicated team is ready to take you for site visits daily.',
    image: '/Sales Team.webp'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: 'The Road to Wealth: How the Kenol-Sagana-Marua Highway is Transforming Central Kenya',
    date: 'Dec 15, 2025',
    category: 'Infrastructure',
    excerpt: 'The completion of the Kenol-Sagana-Marua dual carriageway has officially opened up the Mt. Kenya region, making towns like Makutano and Sagana the hottest investment hubs of 2025.',
    content: `For decades, the journey from Nairobi to the Mt. Kenya region was synonymous with traffic snarl-ups at Kenol and slow-moving trucks on the single-lane highway. Today, in late 2025, the narrative has completely changed. The completion and full operationalization of the Kenol-Sagana-Marua dual carriageway is not just an engineering marvel; it is the single most significant economic catalyst for Central Kenya in this decade.

As a seasoned real estate observer, I have watched dusty towns transform into vibrant economic hubs almost overnight. The town of Makutano, once just a junction, is now a thriving commercial center. Why? Accessibility. The drive from Nairobi, which used to be a tiresome 2-3 hour ordeal, has been slashed to under an hour. This drastic reduction in travel time has effectively turned areas like Murang’a South into "bedroom communities" for the capital city.

**The "Dual Carriageway Effect" on Land Prices**
History repeats itself. We saw it with Thika Road. We saw it with the bypasses. Now, we are seeing it here. Land prices in Makutano, Sagana, and Maragua have appreciated by over 40% in the last 18 months. Investors who had the foresight to buy plots when the road was just a blueprint are now sitting on gold. But is it too late? Absolutely not.

The "ripple effect" is currently moving inwards. While highway-fronting plots have skyrocketed, the interior parcels—perfect for residential homes and farming—are still surprisingly affordable. A 50x100 plot in these areas, just a few kilometers from the tarmac, offers a serene environment with the convenience of city access. This is where the smart money is moving in 2025.

**Why Smart Investors are Choosing This Route**
Beyond just the road, the associated infrastructure—service lanes, footbridges, and market stalls—has spurred local business. We are seeing petrol stations, malls, and gated communities springing up. For a land buyer, this means one thing: *Value Addition*. You are not just buying soil; you are buying into a developing ecosystem.

At Provision Land & Properties Ltd, we identified this trend early. Our projects in Sagana and Makutano were selected precisely because of this infrastructure boom. We knew that once the tarmac hit the ground, the value for our clients would multiply. And it has.

**The Verdict**
If you are sitting on the fence, looking at land in 2025, look North. The Kenol-Sagana corridor is no longer a speculation; it is a proven growth trajectory. Whether you want to build a country home away from the Nairobi noise or speculate for capital gains, the time to enter this market is now, before the prices catch up to Thika's levels.`,
    image: '/kenya-infrastructure.webp'
  },
  {
    id: 'b2',
    title: 'The Digital Shift: Navigating Land Transactions on Ardhisasa in 2025',
    date: 'Nov 22, 2025',
    category: 'Legal & Tech',
    excerpt: 'Gone are the days of missing files and manual searches. The Ardhisasa platform has revolutionized land dealings in Kenya, ensuring transparency and speed for title deed processing.',
    content: `The year 2025 marks a turning point in Kenya's land history. We have finally moved from the dusty, chaotic manual registries of the past to the streamlined, digital future that is Ardhisasa. For years, the "missing file" syndrome was the nightmare of every land buyer. Today, the National Land Information Management System (NLIMS), popularly known as Ardhisasa, has restored sanity and security to property ownership.

**What Ardhisasa Means for You**
For the common mwananchi, the platform might seem technical, but its benefits are simple: **Security and Speed**.
1.  **Search from Anywhere:** You no longer need to queue at Ardhi House at 6 AM. You can conduct a land search from the comfort of your living room. This transparency allows buyers to verify ownership instantly before committing a single shilling.
2.  **Fraud Prevention:** The digital trail makes it nearly impossible for fraudsters to alter records or sell the same piece of land to multiple people. Your title deed is secure in the digital cloud.
3.  **Faster Transfers:** What used to take six months now takes weeks. The transfer of ownership process is tracked online, with clear milestones.

**Navigating the Challenges**
Like any major system overhaul, the transition hasn't been without its hiccups. In 2024, we saw delays as manual records were digitized. However, in 2025, the system has stabilized significantly. The Ministry of Lands has expanded the system beyond Nairobi to include Kiambu, Murang’a, and Machakos—our key operational areas.

**How Provision Land Helps**
While the system is user-friendly, navigating the legalities requires expertise. We have heard stories of buyers getting stuck at the "valuation" or "stamping" stages. This is where a professional partner becomes invaluable. At Provision Land & Properties Ltd, we have a dedicated legal liaison team that handles the Ardhisasa portal on your behalf. We ensure your KRA PIN is updated, your biodata is verified, and the transfer is initiated correctly.

We don't just sell you land; we hand you a title deed. We embrace this digital era because it aligns with our core value: *Integrity*. When the government creates a system that enforces honesty, it makes our work of delivering genuine promises even easier.

**The Bottom Line**
Don't fear the digital shift. Embrace it. It is the best thing to happen to Kenyan real estate. Ensure your next land purchase is "Ardhisasa Compliant"—a guarantee we offer on all our properties.`,
    image: '/ardhisasa-digital.webp'
  },
  {
    id: 'b3',
    title: 'Why Thika and Machakos are the New Nairobi: The 2025 Housing Boom',
    date: 'Dec 02, 2025',
    category: 'Market Trends',
    excerpt: 'As Nairobi becomes saturated, the savvy investor is looking at the "Satellite Jewels"—Thika and Machakos. Affordable land, better air quality, and spacious living are driving the exodus.',
    content: `Nairobi is full. That is the blunt reality of 2025. With an acre in Kilimani fetching hundreds of millions, and traffic making a 10-kilometer commute feel like a cross-country journey, the Kenyan dream of "a quarter acre and a maisonette" has moved. It hasn't died; it has just moved to the Metropolis. Specifically, to Thika and Machakos.

**The Rise of the "Bedroom Counties"**
We are witnessing a massive demographic shift. Young families and retirees alike are trading the congestion of the city for the serenity of the outskirts. But they aren't moving to the bush; they are moving to fully serviced towns with fiber internet, international schools, and shopping malls.

**Thika: The Industrial Garden**
Thika is a phenomenon. Areas like **Ngoingwa** (where our Tola Estate is located) and **Landless** have transformed into high-end residential estates. Why? Because Thika offers the perfect blend. It is an industrial hub with jobs, yet it retains a green, leafy character that Nairobi lost years ago. The Thika Superhighway remains the artery of commerce, making the commute to the CBD viable for those who still need it.
Land in Thika is appreciating at a rate of 15-20% annually. It is a stable, mature market. It's safe. It's developed. It's ready for immediate settlement.

**Machakos: The Frontier of Affordability**
If Thika is the "Premium" choice, Machakos (specifically areas like **Matuu**) is the "Growth" choice. Matuu is currently where Ruai was ten years ago. It is affordable—incredibly so. For the price of a small balcony in Nairobi, you can own a full 50x100 plot in Matuu.
The expansion of Thika-Garissa road has opened up this corridor. We are seeing massive interest from "Land Bankers"—people buying large tracts to hold for 5-10 years. But we are also seeing construction. The county government's incentives for development are working.

**What This Means for 2026 and Beyond**
The trend is irreversible. Urbanization is expanding outwards. The "Nairobi Metropolitan Area" now effectively includes Murang'a South and Machakos. Buying land here is not just buying dirt; it's buying a future slot in the expanded city.

**Advice to Buyers**
Do not wait for the tarmac to reach the plot to buy it; buy it, and wait for the tarmac. By the time the infrastructure is perfect, the price will be out of reach. Look at our listings in Ngoingwa and Matuu. Visit them. Feel the air. You will understand why thousands of Kenyans are saying "Goodbye Nairobi, Hello Neighbors".`,
    image: '/real-estate-boom.webp'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'tm1',
    name: 'James Mwangi',
    role: 'Investor',
    content: 'I bought my plot in Ithanga for 700k. The title deed was ready as promised. Genuine people.',
    avatar: '/James Mwangi.webp'
  },
  {
    id: 'tm2',
    name: 'Sarah Njoroge',
    role: 'Homeowner',
    content: 'The 1 acre in Mang’u is a gem. 10 mins from town and very affordable compared to others.',
    avatar: '/Sarah Njoroge.webp'
  },
  {
    id: 'tm3',
    name: 'David Otieno',
    role: 'Business Owner',
    content: '5-star service! They took me for a site visit and the process was seamless.',
    avatar: '/David Otieno.webp'
  }
];