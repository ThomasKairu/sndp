import { Property, TeamMember, BlogPost, Testimonial, Service } from './types';

export const COMPANY_INFO = {
  name: "Provision Land & Properties Ltd",
  phone: "+254 797 331 355",
  whatsapp: "+254 119 715 900",
  whatsappLink: "https://wa.me/254119715900",
  email: "info@provisionlands.co.ke", // Updated from flyer
  secondaryEmail: "provision254@gmail.com",
  address: "Clairbourn Towers, 5th Fl, Thika, Kenya", // Updated from flyer
  slogan: "We Promise and Deliver Genuinely",
  facebook: "https://facebook.com/profile.php?id=61588103512394",
  twitter: "/",
  instagram: "https://www.instagram.com/provision_land_properties_ltd/",
  youtube: "https://www.youtube.com/@ProvisionLandPropertiesLtd/videos",
  linkedin: "https://linkedin.com/in/provision-land-and-properties-54502a2a2",
  // Google Maps location
  googleMapsUrl: "https://www.google.com/maps/place/Provision+Land+%26+Properties+Ltd/@-1.035323,37.074561,17z/data=!3m1!4b1!4m6!3m5!1s0x182f4f0058accd97:0x2760e84f8974afbe!8m2!3d-1.035323!4d37.074561!16s%2Fg%2F11vylj2svd",
  googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.166837891!2d37.074561!3d-1.035323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f4f0058accd97%3A0x2760e84f8974afbe!2sProvision%20Land%20%26%20Properties%20Ltd!5e0!3m2!1sen!2ske!4v1",
  coordinates: { lat: -1.035323, lng: 37.074561 },
  businessHours: {
    weekdays: "Monday-Friday: 8 a.m. to 4 p.m.",
    saturday: "Saturday: 8 a.m. to 1 p.m.",
    sunday: "Sunday: On call as per request"
  }
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
    size: '40x80 ft',
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
    id: 'ardhisasa-registration-guide',
    title: 'Ardhisasa Registration: The Complete Step-by-Step Guide (2026)',
    date: 'Jan 25, 2026',
    category: 'Legal & Tech',
    excerpt: 'Struggling to register on Ardhisasa? Here is the definitive guide to creating an account, upgrading your details, and navigating the Ministry of Lands digital platform.',
    content: `Ardhisasa is the National Land Information Management System (NLIMS). It is an online platform that allows citizens, lawyers, and other stakeholders to interact with land information held by the government.

It allows the lodgment of applications for various services offered by the Ministry of Land and the National Land Commission. The applications are handled through the Ardhisasa platform and responses presented through it.

### Step 1: Create an Ardhisasa Account

Before you can conduct any transaction, you must register on the Ardhisasa portal. If you already have an account, you can skip this part and proceed to log in.

**How do you register with Ardhisasa?**

Open your browser and go to [https://ardhisasa.lands.go.ke/home](https://ardhisasa.lands.go.ke/home). Click the "Register" button. Select " Individuals" if you are registering as a personal user or "Company" if you are registering on behalf of a business.

Proceed to fill in your details. Some of the details needed include your National ID Number, your Official Names (as they appear on the ID), your Phone Number, and your Email Address.

Once you are done, create a strong password and verify your account. A one-time password (OTP) will be sent to your phone via SMS. Enter it to verify the account.

**Can I register when I am not in Nairobi?**

Yes. It is possible to register while outside Nairobi. However, it is important to note that primarily parcels in Nairobi and its environs are available for transaction on the Ardhisasa platform at the moment, though digitization is expanding to other counties.

### Step 2: Set Up Your Profile (Account Upgrade)

Creating the account is just the beginning. To transact, you must "upgrade" your account by providing more specific details.

**Why do I need to upgrade my account?**

The system needs to verify your identity against the Kenya Revenue Authority (KRA) database to facilitate Stamp Duty payments and fraud prevention.

**How to upgrade:**

Log

 in to your new account. Navigate to the "My Profile" section. You will be required to upload a clear, recent Passport Photo, enter your KRA PIN Number, and verify your phone number again.

Once this is complete, your account is fully active and ready to perform searches and transfers.

**Provision Land & Properties Ltd** has all its plots for sale verified on Ardhisasa where clients can conduct independent searches before investing their money. You can contact Provision Land & Properties Ltd via +254 797 331 355 for further assistance with Ardhisasa registration.`,
    image: '/ardhisasa-digital.webp'
  },
  {
    id: 'how-to-conduct-land-search-kenya',
    title: 'How to Conduct a Land Search in Kenya: 5 Easy Steps to Follow',
    date: 'Jan 24, 2026',
    category: 'Legal & Tech',
    excerpt: 'Conducting a land search is the most critical step in buying property. Learn how to navigate Ardhisasa, conduct manual searches, and spot red flags before you pay.',
    content: `Ardhisasa is an online platform that allows citizens and other stakeholders to interact with land information held by the government. It allows the lodgment of applications for various services offered by the Ministry of Land and the National Land Commission. The applications are handled through the Ardhisasa platform and responses presented through it.

### Step 1: Create an Ardhisasa Account

Before conducting a land search, you must register on the Ardhisasa portal. If you already have an account, you can skip this part and proceed to log in.

**How do you register with Ardhisasa?**

Open your browser and go to [https://ardhisasa.lands.go.ke/home](https://ardhisasa.lands.go.ke/home). Click "Register". Select "Individuals" if registering as an individual or "Company" if registering as a business and proceed to fill in your details. Some of the details needed include the National ID Number, full name, phone number, and email address.

Once you are done, create a strong password and verify your account. A one-time password (OTP) will be sent to your phone via SMS. Enter it to verify the account.

**Can I register when I am not in Nairobi?**

Yes. It is possible to register while outside Nairobi. However, it's important to note that only parcels in Nairobi and its environs are available for transaction on the Ardhisasa platform at the moment.

### Step 2: Log In to Your Account

Having created your account already, click "Sign In" and enter your ID number and password.

Click "Login" to access your dashboard. You can update additional details, including your KRA PIN and passport-size photo.

### Step 3: Select the Land Search Service

On the dashboard, you will spot several service options related to land and property management. Locate and click on "Search" then select "Official Land Search". This option allows you to trace details of the real owner of the land as registered by the Ministry of Lands.

Remember to provide the reason for the search, which is often to identify the owner of a particular piece of land that you are interested in.

### Step 4: Enter Land Parcel Details

Select the county where the land is located to refine the search and limit it to a specific location.

Enter the Title Number or Parcel Number (e.g., Nairobi/Block123/456) then click "Search" to proceed.

### Step 5: Make Payment and Download Certificate

Once you click search, the owner of the land will be prompted to approve the request. Once they approve, the system will automatically display the land details, which you should review very carefully. These details include:
*   Registered owner(s): The name(s) of the person(s) or entity legally registered as the owner of the land.
*   Land size: The total area of the parcel, usually indicated in hectares or acres. Confirm if it matches what you are being sold.
*   Encumbrances: Any legal claims, loans, disputes, or restrictions attached to the land. For instance, if the land is being used as collateral for a loan, the system will indicate this.

To access the full land search report, you are required to pay a fee of Ksh 500. Ardhisasa provides several payment options such as M-Pesa, credit card, and bank option.

Once you complete the payment, the system will confirm receipt and automatically generate an electronic receipt. You can download or print this receipt for future reference.

**Provision Land & Properties Ltd** has all its plots for sale verified on the [Ardhisasa app](https://ardhisasa.lands.go.ke) where clients can conduct a **provisionlands land search** before investing their money. You can contact Provision Land & Properties Ltd via +254 797 331 355 for further assistance. You can also visit our office at Clairbourn Towers, 5th Floor, Thika, Kenya.`,
    image: '/ardhisasa-digital.webp'
  },
  {
    id: 'what-is-a-caveat-in-property',
    title: 'What is a Caveat in a Property',
    date: 'Jan 22, 2026',
    category: 'Education',
    excerpt: 'The word "Caveat" can stop a real estate transaction dead in its tracks. Learn what it is, who places it, and how to remove it.',
    content: `The essence of having a Caveat on property is that it protects you from adverse claims by third parties and assists in securing title against any potential disclosure issues associated with buying any property of interest that has already been taken.

### What is a Caveat?

In this case, interest means a right, power, or privilege over land or property. And for one to claim an interest in property, they need to have shown sufficient interest in the property through an equitable mortgage.

A **caveat** (Latin for "let him beware") is a formal notice lodged at the Lands Registry to warn the public that a specific interest is claimed on that property.

**What is the effect of a Caveat?**

When a Caveat is lodged against a Title Deed, it acts as a "freeze" order. The Land Registrar is legally barred from registering any dealing on that land. This means the land cannot be transferred or sold, the land cannot be used as security for a loan (Charged), and the land cannot be subdivided.

### Who Can Lodge a Caveat?

You ought to ensure you have a genuine interest when lodging caveats, which are as follows:
*   A registered or equitable mortgage
*   A transfer purchaser under an agreement for sale
*   A tenant (in certain circumstances)
*   A registered proprietor with contractual rights

Caveats are for home buyers and sellers. If you have an estate or interest in land that registration of another deal cannot protect, you may consider lodging a caveat to protect your legal position.

### Requirements for Lodging a Caveat

The caveat requires the following details:
*   The caveator's name and residential address or registered office, including an address where notices can be served
*   The name and address of the registered proprietor
*   Reference details to which the caveat relates
*   Particulars of the legal or equitable estate of interest
*   A verified statutory declaration
*   The signature of the caveator, lawyer, or another agent of the caveator

Before lodging a caveat, you should take steps to ensure you have a caveatable interest in the property. Otherwise, you may be liable to pay compensation to the wronged parties due to an incorrectly lodged caveat. A person claiming interest in a lot to be transferred is eligible to lodge a caveat.

### How to Remove a Caveat

A Caveat may be withdrawn at the Caveator's request at any time. A request to withdraw a caveat document must be signed and lodged with the Registrar.

A caveat that has been lodged without the consent of the registered owner will lapse within 3 months if the caveator does not initiate court proceedings to enforce their rights.

At **Provision Land & Properties Ltd**, all our titles are free of encumbrances and caveats. We ensure 100% genuine transactions for our clients. Contact us at +254 797 331 355 for verified plots.`,
    image: '/James Mwangi.webp'
  },
  {
    id: 'can-foreigners-buy-property-kenya',
    title: 'Owning Land as a Foreigner in Kenya: Everything You Need to Know',
    date: 'Jan 20, 2026',
    category: 'Guides',
    excerpt: 'Are you an expat or diaspora investor looking to buy land? Discover the legal rights, restrictions, and freehold vs leasehold rules for foreigners.',
    content: `Kenya is a prime investment destination for foreigners. The question many expatriates and diaspora investors ask is: **"Can foreigners buy property in Kenya?"** The answer is YES, but with specific constitutional restrictions that you must be aware of.

### The Key Restriction: Leasehold vs. Freehold

The most important rule for foreigners is found in the Constitution of Kenya (2010).

**Leasehold Tenure Only**

A non-citizen can ONLY hold land under a **Leasehold** tenure. The maximum term for this lease is **99 years**.

This applies even if you buy land from a local who has a "Freehold" title. For example, if John (a Kenyan) sells his Freehold agricultural land to Smith (a British citizen), the moment the transfer is registered, the Government converts that specific title into a 99-year Leasehold.

**What happens after 99 years?**

Upon the expiry of the lease, the foreigner can apply for a renewal of the lease.

### Agricultural Land Restrictions

Under the Land Control Act, dealings in agricultural land are generally "controlled". Technically, foreigners are restricted from owning agricultural land directly to protect the nation's food security.

**The Workaround**

However, the President does have the power to grant exemptions, though this is rare. Many foreigners navigate this by investing in Commercial Zones (buying apartments or office blocks in cities) or forming Private Limited Companies where the land is held. However, strict rules apply—if the company is wholly owned by foreigners, the land is still considered leasehold.

### Various Ways in Which a Foreigner Can Own Land in Kenya

There are several legal avenues through which foreigners can acquire property:
1.  **Through Leasehold:** This is the most common and straightforward method
2.  **Through a Private Limited Company:** Where the company holds the land on behalf of the shareholders
3.  **Through Investment Zones:** Buying in designated commercial or residential areas

### Requirements for a Foreign Buyer

To begin the process of buying land, a foreign investor needs:
*   A KRA PIN: You must register with the [Kenya Revenue Authority](https://itax.kra.go.ke)
*   Valid Identification: A valid Passport or Alien ID
*   Address: A local postal address in Kenya

###How a Non-Kenyan Citizen Can Conduct Due Diligence on Property in Kenya

Before purchasing property, it is crucial for foreigners to conduct thorough due diligence:
*   Verify the title deed at the Ministry of Lands
*   Conduct a land search to confirm ownership and check for encumbrances
*   Engage a reputable lawyer who understands property law
*   Visit the property physically and confirm the beacons

**Provision Land & Properties Ltd** welcomes foreign investors and provides full legal support for leasehold transfers. Contact us at +254 797 331 355 for expert guidance on buying land in Kenya as a foreigner.`,
    image: '/Sales Team.webp'
  },
  {
    id: '10-legal-steps-buying-land-kenya',
    title: '10 Legal Steps of Buying Land in Kenya: A Step-by-Step Guide',
    date: 'Jan 15, 2026',
    category: 'Guides',
    excerpt: 'Do not risk your savings. Follow this detailed legal roadmap to safely purchase land, covering everything from the Offer Letter to the Land Control Board.',
    content: `Buying land in Kenya involves a strict legal process. Skipping any of these steps to "save time" or money is the fastest way to fall victim to fraud. Below is the definitive, step-by-step legal process for buying land in Kenya in 2026.

### Step 1: Identify the Land and Conduct Site Visit

Never buy land you have not seen. Before looking at any paperwork, you must physically visit the land.

Ask the seller to show you the concrete beacons marking the four corners of the plot. Talk to the neighbors and ask them who owns the land and if there are any disputes.

### Step 2: Conduct a Land Search

You must conduct an official search at the Ministry of Lands. This confirms ownership and checks for any encumbrances like bank loans or caveats.

For Nairobi properties, you can do this online through [Ardhisasa](https://ardhisasa.lands.go.ke). For other areas like Thika, Machakos, and Murang'a, you must visit the local Lands Registry.

### Step 3: Obtain Land Maps and Survey

Do not trust your eyes alone to judge the size of the land.

Go to the Survey of Kenya and buy the **Mutation Map** (shows dimensions) and the **Cadastral Map** (shows position). Hire a licensed surveyor to visit the site. They will measure the land to confirm it matches the map.

### Step 4: Request for a Letter of Offer

Once you are satisfied with your due diligence, ask for a formal Letter of Offer. This is drafted by the seller or their lawyer. It outlines the price, the payment plan (deposit vs installments), and the completion date.

### Step 5: Sign the Sale Agreement

This is the main contract. It binds the buyer and the seller.

You must have your lawyer review this document effectively. You typically pay a 10% deposit upon signing this agreement. It must be witnessed by an Advocate of the High Court.

### Step 6: Apply for Land Control Board Consent

For agricultural or freehold land, you must get consent from the Land Control Board (LCB).

The board members (local elders and officials) meet once a month. Both the Buyer and Seller must appear in person to answer questions. This is to prevent a spouse from selling family land without consent.

### Step 7: Land Valuation by Government Valuer

Before the transfer can happen, the government must value the land to determine how much tax you will pay.

You apply to the Government Valuer, who visits the land to determine its "Market Value".

### Step 8: Payment of Stamp Duty

Stamp Duty is the tax you pay to the government for the property transfer.

For Urban Land, you pay 4% of the value. For Rural Land, you pay 2% of the value. This is paid via the [KRA iTax portal](https://itax.kra.go.ke).

### Step 9: Prepare and Sign Transfer Documents

Once you have paid the balance of the purchase price, the Seller signs the **Transfer Forms**.

They hand over the Original Title Deed, copies of their ID and PIN, passport photos, and Clearance Certificates (Land Rent and Rates).

### Step 10: Registration and Title Issuance

Your lawyer books all these documents at the Lands Registry for registration. The Registrar cancels the old title and prints a new **Title Deed** in your name.

**Provision Land & Properties Ltd** handles steps 2 through 10 for our buyers. When you buy with us, we ensure the legal process is seamless. Contact us at +254 797 331 355 or visit us at Clairbourn Towers, 5th Floor, Thika.`,
    image: '/Sales Team.webp'
  },
  {
    id: 'surveying-mutation-kenya',
    title: 'Everything You Need to Know About Land Survey',
    date: 'Dec 28, 2025',
    category: 'Technical',
    excerpt: 'The surveyor is the most important technical person in your land journey. Understand fixed boundaries, mutations, and how to read a map.',
    content: `Land surveying is the art and science of establishing and re-establishing real property boundaries. In Kenya, understanding this process is your best defense against boundary disputes.

### What is Land Survey?

A land survey is a scientific process of measuring and mapping land to determine boundaries, elevations, and positions of features. It is conducted by a Licensed Land Surveyor who is registered with the Land Surveyors Board.

### Reasons for Doing Land Survey

There are several important reasons why you need a land survey:

**a) To Identify Land Boundary**

This helps you know the exact extent of your property and prevents encroachment by neighbors.

**b) Locate Utilities on the Land**

A survey identifies the location of water pipes, sewer lines, electricity cables, and other utilities on your land.

**c) Settling Boundaries Disputes**

If you have a dispute with a neighbor about where your land ends and theirs begins, a survey provides legal proof.

**d) For Purpose of Developing a House**

Architects and engineers need accurate land measurements to design a house that fits correctly on your plot.

**e) New Subdivision of Land**

If you are subdividing a large parcel into smaller plots, a surveyor must create a subdivision plan.

### What is "Mutation" in Property?

A **Mutation Form** is a document that records the change in the boundaries of a piece of land.

When land is subdivided, the surveyor draws a "Mutation Sketch" showing the shape and dimensions of each new plot. This sketch is submitted to the Survey of Kenya, and the Registry Index Map (RIM) is updated to show the new plots exist.

**Warning to Buyers:** Never buy a subdivided plot if the seller cannot show you the **Approved Mutation Form**. Without this form, you cannot process a title deed.

### Land Survey Methods

**General Boundary Survey**

This is common in rural areas. The map uses physical features like hedges or fences to mark the boundary. It is not mathematically precise (approximate area).

**Fixed Boundary Survey**

This is used in high-value urban land (like Nairobi CBD or Runda). The corners are defined by precise grid coordinates. Even if a beacon is removed, a surveyor can reset it to the exact millimeter.

At **Provision Land & Properties Ltd**, all our land is properly surveyed with approved mutation forms. We ensure our clients receive accurate maps for every plot they purchase.`,
    image: '/Tola Ngoingwa.webp'
  },
  {
    id: 'building-home-kenya-guide',
    title: 'A Step-by-Step Guide to Building Your Dream Home in Kenya',
    date: 'Dec 15, 2025',
    category: 'Construction',
    excerpt: 'Your comprehensive roadmap to navigating the journey of building a home. From Pre-construction paperwork to the final coat of paint.',
    content: `Building your own home in Kenya is a fulfilling legacy project. However, without a clear plan, it can be overwhelming. Here is a professional breakdown of the phases involved.

### Phase 1: Planning and Pre-Construction

Before a single stone is laid, the "paperwork foundation" must be solid.

**1. Architectural Design**
Hire a registered architect to design your home. They will produce:
*   Floor plans
*   Elevations (Side views of the house)
*   Sections (Cut-through views)

**2. Structural Engineering**
You need a structural engineer to calculate the weight of the building. They determine the structural integrity, specifying the thickness of steel (Y10, Y12, Y16) and the ratio of cement needed.

**3. The Bill of Quantities (BQ)**
This is a crucial step. A Quantity Surveyor (QS) calculates the exact cost of the project. The BQ lists every bag of cement, load of sand, and box of tiles needed. **Tip:** Never build without a BQ, as it prevents contractor theft.

**4. Approvals**
You must submit your plans to the **County Government** for approval (often called the "Blue Stamp"). You also need to register the project with the **National Construction Authority (NCA)**.

### Phase 2: Choosing Your Team

You generally have two options for managing the build:

**Option A: Full Contract**
You hire a main contractor who buys the materials and manages the labor. This is less stressful but more expensive.

**Option B: Labour Contract (Fundi)**
You buy the materials yourself, and the contractor provides only the labor. This is cheaper but requires high supervision to prevent theft of materials.

### Phase 3: The Construction Process

**Step 1: The Substructure (Foundation)**
This involves excavation, pouring the footing, building the foundation walls, and pouring the slab. **Tip:** Ensure you "cure" (water) the concrete for at least 21 days to ensure strength.

**Step 2: The Superstructure (Walling)**
The walls go up. You can use machine-cut stones (which are neat and save on plaster) or brick.

**Step 3: Roofing**
This is the "drying" stage. Trusses are installed, followed by the iron sheets or clay tiles.

**Step 4: Finishes**
This stage consumes 40-50% of your budget. It includes plastering, flooring (tiles), window installation, painting, and joinery (cabinets).

### Final Advice

Always have a contingency fund of at least 20% of your budget to cover price fluctuations in materials like steel and cement.`,
    image: '/Prime half Acre in Kiharu.webp'
  },
  {
    id: 'land-infrastructure-wealth',
    title: 'The Road to Wealth: How Infrastructure Transforms Land Value',
    date: 'Dec 05, 2025',
    category: 'Infrastructure',
    excerpt: 'The Kenol-Sagana-Marua dual carriageway has changed the game. Learn why buying land near infrastructure projects is the secret to wealth.',
    content: `In real estate investment, the adage is "Infrastructure, Infrastructure, Infrastructure". The single biggest driver of land appreciation is government road projects.

### The "Thika Road" Lesson

In 2008, an acre in Ruiru was selling for roughly Ksh 2 Million. Today, after the completion of the Thika Superhighway, that same acre can fetch upwards of Ksh 60 Million. Investors who saw the bulldozers coming and bought early made generational wealth.

### The New Frontier: Kenol-Sagana-Marua

The government has just completed the dualing of the Kenol-Sagana-Marua road. This 84km stretch has opened up Murang'a, Kirinyaga, and Nyeri counties.

**Reduced Travel Time**
The drive from Nairobi to Sagana is now under 1 hour. This makes towns like **Makutano** and **Sagana** viable "bedroom" towns for people working in Nairobi.

**Land Value Spike**
Plots that were selling for Ksh 200k in 2022 are now touching Ksh 650k. The growth curve is just starting.

### How to Invest Strategically

**The "Goldilocks" Zone**
Don't just buy anywhere. The best strategy is to buy land **2km to 5km** from the tarmac. Highway frontage is too expensive for capital gains (the price is already high). Interior land is affordable but appreciates fast as feeder roads are improved.

**Provision Land Opportunity**
We identified this trend early. Our projects in **Sagana** and **Ithanga** are strategically positioned to benefit from this exact infrastructure boom.`,
    image: '/kenya-infrastructure.webp'
  },
  {
    id: 'thika-machakos-growth',
    title: 'Why Thika and Machakos are the "New Nairobi" for Investors',
    date: 'Nov 20, 2025',
    category: 'Market Trends',
    excerpt: 'Nairobi is saturated. The smart money is moving to the Nairobi Metropolis. Discover why Thika and Matuu (Machakos) are the future.',
    content: `Nairobi is full. The congestion, pollution, and astronomical land prices (Ksh 400M per acre in Kilimani) have pushed the Kenyan Dream outwards. We are witnessing the rise of the **Nairobi Metropolis**.

### The Thika Phenomenon

Thika isn't just a "town" anymore; it is an industrial city with a high quality of life.

**Lifestyle:** Estates like **Ngoingwa** offer leafy, serene environments that resemble Runda, but at a fraction of the cost.
**Stability:** It is a mature market. Prices rise steadily (approx 15% p.a.), offering safe, predictable returns.

### The Machakos Frontier (Matuu)

If Thika is the mature brother, Machakos (specifically Matuu) is the energetic, high-growth teenager.

**Affordability:** You can still find a strictly genuine 50x100 plot in Matuu for under Ksh 300,000. This is the entry point for young investors.
**The Garissa Road Factor:** The expansion of the Thika-Garissa highway has turned Matuu into a major transit hub.

### Investment Strategy for 2026

**The Aggressive Strategy:** Buy in Matuu. Hold for 5 years. Expect 100%+ appreciation.
**The Conservative Strategy:** Buy in Thika (Ngoingwa). Build rental units or your retirement home immediately.`,
    image: '/real-estate-boom.webp'
  },
  {
    id: 'land-business-investment',
    title: '4 Reasons Why Land is a Profitable Business Investment',
    date: 'Nov 10, 2025',
    category: 'Investment',
    excerpt: 'Is land just dirt? No. It\'s a business asset. Here is how to use land to generate cash flow, not just capital gains.',
    content: `Many Kenyans view land emotionally—as a place to bury their ancestors or build a family home. While true, land is primarily a **financial instrument**. Here are 4 reasons why land beats stocks, bonds, and savings accounts in the Kenyan context.

### 1. Collateral Leverage (The Secret of the Rich)

The richest people don't use their own money to expand business; they use the bank's money.

**The Play:** You buy a plot for Ksh 1M. You get a Title Deed. You walk into a bank and they hold the title and lend you Ksh 700k.

**The Result:** You use that Ksh 700k to stock your hardware shop or expand your business. The shop profits pay the loan. You kept the asset (land, which is appreciating) and grew your cash flow.

### 2. Zero Maintenance Costs

**Apartments:** Tenants call you at 1 AM because a pipe burst. You pay monthly service charges. You repaint every two years. The lift breaks down.

**Cars:** They depreciate the moment you drive off the lot. You pay for insurance, fuel, and constant servicing.

**Land:** It eats nothing. It needs no painting, no repairs, no service charge. It just sits there, silently growing in value while you sleep.

### 3. High Appreciation Rates

The Kenyan population is exploding (currently over 50 Million people), but the land mass is fixed. Simple economics: High demand + Fixed Supply = Higher Prices.

**The Math:** Land in satellite towns like Thika, Ruiru, and Matuu averages 10-20% appreciation annually. Inflation is approximately 6-8%. Land effectively protects your purchasing power and beats inflation.

### 4. Income Generation(Without Building)

You don't need millions to build rental apartments to earn from land. You can lease land for:

**Leasing to Farmers:** Short term crops like onions, watermelons, or tomatoes. The farmer pays you rent per season.

**Commercial Leases:** If your land is near a road, lease it to car wash businesses, mechanics, or hardware storage yards.

**Telecommunications:** Safaricom and Airtel pay premium monthly rent to place communication masts on strategically located high-ground land.

**Provision Land & Properties Ltd** has plots ideal for both investment and development. All our properties come with ready title deeds. Visit [https://provisionlands.co.ke](https://provisionlands.co.ke) or call +254 797 331 355 to start building your land portfolio today.`,
    image: '/Mwingi Acre.webp'
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