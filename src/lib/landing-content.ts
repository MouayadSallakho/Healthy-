/**
 * Static content for the Barbell Kitchen landing page.
 *
 * Keeping copy and data here (separate from layout) makes the page easy to
 * maintain and localize. Icon fields are string keys resolved by the central
 * icon map in `components/landing/icons.tsx`.
 */

/**
 * Single source of truth for the future product/menu listing route.
 * Every "Order Now / Explore Menu / Choose Meal / Shop Meals" CTA points here.
 * Change this one value if the final route differs.
 */
export const PRODUCTS_ROUTE = "/products";

export type IconName =
  | "protein"
  | "leaf"
  | "scale"
  | "flame"
  | "bolt"
  | "truck"
  | "clock"
  | "dumbbell"
  | "target"
  | "heart"
  | "check"
  | "star"
  | "calendar"
  | "shield"
  | "spark";

export const brand = {
  name: "Barbell Kitchen",
  tagline: "Clean Food. Stronger You.",
  badge: "Inside Your Gym",
} as const;

export const promoMessages: { icon: IconName; text: string }[] = [
  { icon: "spark", text: "New members get 10% off their first order" },
  { icon: "dumbbell", text: "Fresh performance meals prepared inside your gym" },
  { icon: "clock", text: "Order before training. Pick up after your workout." },
];

export const navLinks: { label: string; href: string }[] = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#menu" },
  { label: "Meal Plans", href: "#plans" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#inside-gym" },
  { label: "Contact", href: "#footer" },
];

export const hero = {
  badge: "Healthy food, inside your gym",
  headlineLines: ["Clean Food.", "Stronger You."],
  paragraph:
    "Healthy meals made inside your gym. High-protein, macro-balanced dishes prepared fresh for training, recovery, and everyday performance.",
  bullets: [
    "High-protein & macro-balanced",
    "Fresh ingredients, prepped daily",
    "In-gym pickup or delivery",
  ],
  primaryCta: "Order Your Meal",
  secondaryCta: "Explore Menu",
  readyNote: "Ready in 15–20 minutes",
  proof: [
    { value: "4.9/5", label: "Member rating" },
    { value: "1,200+", label: "Happy members" },
    { value: "Daily", label: "Freshly prepared" },
  ],
  floatingCards: [
    { icon: "protein" as IconName, value: "49g", label: "Protein" },
    { icon: "flame" as IconName, value: "480", label: "Calories" },
    { icon: "clock" as IconName, value: "20 min", label: "Ready" },
    { icon: "scale" as IconName, value: "Balanced", label: "Macros" },
  ],
};

export const benefits: { icon: IconName; label: string }[] = [
  { icon: "protein", label: "High Protein" },
  { icon: "leaf", label: "Fresh Ingredients" },
  { icon: "scale", label: "Macro Balanced" },
  { icon: "flame", label: "Calorie Counted" },
  { icon: "bolt", label: "Fast Pickup" },
  { icon: "truck", label: "In-Gym Delivery" },
];

export type Macros = {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
};

export type Meal = {
  id: string;
  name: string;
  image: string;
  ingredients: string;
  macros: Macros;
  price: string;
  tag: string;
  category: "high-protein" | "low-carb" | "bulking" | "cutting" | "smoothies";
};

export const featuredMeals: Meal[] = [
  {
    id: "grilled-chicken-fuel",
    name: "Grilled Chicken Fuel",
    image: "/images/meal-chicken.png",
    ingredients: "Grilled chicken breast, jasmine rice, broccoli, avocado",
    macros: { protein: 49, carbs: 52, fat: 14, calories: 540 },
    price: "$12.90",
    tag: "Bestseller",
    category: "high-protein",
  },
  {
    id: "lemon-herb-salmon",
    name: "Lemon Herb Salmon",
    image: "/images/meal-salmon.png",
    ingredients: "Atlantic salmon, sweet potato, asparagus, greens",
    macros: { protein: 42, carbs: 38, fat: 22, calories: 520 },
    price: "$14.50",
    tag: "Omega-3",
    category: "high-protein",
  },
  {
    id: "steak-power-bowl",
    name: "Steak Power Bowl",
    image: "/images/meal-steak.png",
    ingredients: "Lean sirloin, brown rice, black beans, peppers",
    macros: { protein: 51, carbs: 60, fat: 18, calories: 620 },
    price: "$15.90",
    tag: "Bulking",
    category: "bulking",
  },
  {
    id: "turkey-macro-bowl",
    name: "Turkey Macro Bowl",
    image: "/images/meal-turkey.png",
    ingredients: "Lean ground turkey, quinoa, kale, roasted veg",
    macros: { protein: 44, carbs: 34, fat: 12, calories: 430 },
    price: "$12.50",
    tag: "Cutting",
    category: "cutting",
  },
];

export type MenuTab = {
  id: string;
  label: string;
};

export const menuTabs: MenuTab[] = [
  { id: "all", label: "All" },
  { id: "high-protein", label: "High Protein" },
  { id: "low-carb", label: "Low Carb" },
  { id: "bulking", label: "Bulking" },
  { id: "cutting", label: "Cutting" },
  { id: "smoothies", label: "Smoothies" },
];

export const menuItems: Meal[] = [
  ...featuredMeals,
  {
    id: "recovery-smoothie",
    name: "Recovery Smoothie",
    image: "/images/meal-smoothie.png",
    ingredients: "Whey protein, banana, peanut butter, oats, almond milk",
    macros: { protein: 35, carbs: 44, fat: 10, calories: 410 },
    price: "$8.50",
    tag: "Post-workout",
    category: "smoothies",
  },
  {
    id: "low-carb-bowl",
    name: "Low-Carb Garden Bowl",
    image: "/images/meal-lowcarb.png",
    ingredients: "Grilled chicken, cauliflower rice, avocado, mixed greens",
    macros: { protein: 46, carbs: 18, fat: 20, calories: 420 },
    price: "$13.50",
    tag: "Low Carb",
    category: "low-carb",
  },
];

export type MealPlan = {
  id: string;
  icon: IconName;
  name: string;
  bestFor: string;
  description: string;
  price: string;
  cadence: string;
  mealsPerDay: string;
  featured?: boolean;
};

export const mealPlans: MealPlan[] = [
  {
    id: "bulk",
    icon: "dumbbell",
    name: "Bulk Plan",
    bestFor: "Best for mass gain",
    description: "Calorie-dense, high-protein meals to support muscle growth.",
    price: "$129",
    cadence: "/ week",
    mealsPerDay: "3 meals / day",
  },
  {
    id: "cut",
    icon: "flame",
    name: "Cut Plan",
    bestFor: "Best for fat loss",
    description: "Lean, calorie-controlled meals that keep protein high.",
    price: "$119",
    cadence: "/ week",
    mealsPerDay: "3 meals / day",
  },
  {
    id: "balanced",
    icon: "scale",
    name: "Balanced Plan",
    bestFor: "Best for everyday health",
    description: "Macro-balanced meals for steady energy and recovery.",
    price: "$109",
    cadence: "/ week",
    mealsPerDay: "2 meals / day",
    featured: true,
  },
  {
    id: "performance",
    icon: "bolt",
    name: "Performance Plan",
    bestFor: "Best for athletes",
    description: "Fueling built around your training days and recovery.",
    price: "$149",
    cadence: "/ week",
    mealsPerDay: "3 meals + smoothie",
  },
];

export const planPerks: { icon: IconName; label: string }[] = [
  { icon: "calendar", label: "Weekly flexibility" },
  { icon: "check", label: "Pause or cancel anytime" },
  { icon: "shield", label: "Nutritionist approved" },
  { icon: "truck", label: "In-gym pickup or delivery" },
];

export type MacroGoal = {
  id: string;
  icon: IconName;
  label: string;
  mealStyle: string;
  calorieDirection: string;
  proteinFocus: string;
};

export const macroGoals: MacroGoal[] = [
  {
    id: "build",
    icon: "dumbbell",
    label: "Build Muscle",
    mealStyle: "Hearty protein + complex carbs",
    calorieDirection: "Slight calorie surplus",
    proteinFocus: "45–55g protein per meal",
  },
  {
    id: "lose",
    icon: "flame",
    label: "Lose Fat",
    mealStyle: "Lean protein + high-volume veg",
    calorieDirection: "Controlled calorie deficit",
    proteinFocus: "40–50g protein per meal",
  },
  {
    id: "maintain",
    icon: "scale",
    label: "Maintain",
    mealStyle: "Balanced macro plates",
    calorieDirection: "Calories at maintenance",
    proteinFocus: "35–45g protein per meal",
  },
  {
    id: "clean",
    icon: "leaf",
    label: "Eat Clean",
    mealStyle: "Whole foods, minimal processing",
    calorieDirection: "Flexible, nutrient-dense",
    proteinFocus: "30–45g protein per meal",
  },
];

export const howItWorks: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "target",
    title: "Choose your meal",
    text: "Browse the menu and pick meals built for your training goal.",
  },
  {
    icon: "scale",
    title: "Customize macros",
    text: "Adjust portions and macros to match your day's nutrition targets.",
  },
  {
    icon: "truck",
    title: "Pick up or get delivery",
    text: "Collect from the in-gym counter or have it delivered to the lounge.",
  },
];

export const pickup = {
  title: "Fresh meals without leaving the gym.",
  points: [
    "Order before, during, or after training.",
    "Pick up from the restaurant counter inside the gym.",
    "Optional in-gym delivery to the lounge or recovery area.",
    "Fast preparation and a member-friendly experience.",
  ],
  timeline: [
    { icon: "target" as IconName, label: "Order" },
    { icon: "flame" as IconName, label: "Prepare" },
    { icon: "bolt" as IconName, label: "Pickup" },
    { icon: "protein" as IconName, label: "Refuel" },
  ],
};

export type Testimonial = {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
  resultTag: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Marcus K.",
    role: "Member · 3x / week",
    avatar: "/images/avatar-1.png",
    rating: 5,
    quote:
      "Having clean, high-protein meals ready right after my session removed the biggest excuse I had. Meal planning is finally effortless.",
    resultTag: "Easier meal planning",
  },
  {
    name: "Sara R.",
    role: "Member · Strength training",
    avatar: "/images/avatar-2.png",
    rating: 5,
    quote:
      "I grab a bowl before training and a smoothie after. I have way more energy through my workouts and the macros are always on point.",
    resultTag: "More energy",
  },
  {
    name: "David L.",
    role: "Member · Cutting phase",
    avatar: "/images/avatar-3.png",
    rating: 5,
    quote:
      "The calorie-counted meals keep me consistent without thinking about it. It genuinely supports my training routine week after week.",
    resultTag: "Better consistency",
  },
];

export const faqs: { q: string; a: string }[] = [
  {
    q: "Can I order before my workout?",
    a: "Yes. Order ahead from the app or counter and your meal will be ready when you finish training — typically in 15–20 minutes.",
  },
  {
    q: "Do you offer meals for bulking and cutting?",
    a: "Absolutely. Our menu is organized by goal, with calorie-dense bulking options and lean, calorie-controlled cutting meals.",
  },
  {
    q: "Can I customize my macros?",
    a: "You can adjust portions and swap sides to fit your daily protein, carb, and calorie targets on most meals.",
  },
  {
    q: "Is pickup inside the gym?",
    a: "Yes. The restaurant counter is located inside the gym, so you never have to leave to refuel after training.",
  },
  {
    q: "Are meals prepared fresh?",
    a: "Every meal is prepared fresh on-site daily using quality ingredients — nothing frozen or reheated from days before.",
  },
  {
    q: "Do you offer weekly meal plans?",
    a: "We offer flexible weekly plans for bulking, cutting, balanced eating, and performance. Pause or cancel anytime.",
  },
];

export const finalCta = {
  headline: "Ready to Fuel Your Potential?",
  subtext:
    "Order fresh, healthy meals made for your training lifestyle — prepped daily and ready when you are.",
  primaryCta: "Order Now",
  secondaryCta: "View Meal Plans",
  perks: [
    { icon: "truck" as IconName, label: "In-gym pickup" },
    { icon: "leaf" as IconName, label: "Fresh daily" },
    { icon: "spark" as IconName, label: "Member discount" },
    { icon: "scale" as IconName, label: "Macro-ready meals" },
  ],
};

export const footer = {
  description:
    "Healthy, high-protein meals prepared fresh inside your gym — built for training, recovery, and everyday performance.",
  quickLinks: [
    { label: "Menu", href: "#menu" },
    { label: "Meal Plans", href: "#plans" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Inside the Gym", href: "#inside-gym" },
    { label: "FAQ", href: "#faq" },
  ],
  contact: {
    address: "Inside [Your Gym Name], [Street Address]",
    phone: "+1 (000) 000-0000",
    email: "hello@barbellkitchen.example",
  },
  hours: [
    { day: "Mon – Fri", time: "6:00 AM – 10:00 PM" },
    { day: "Saturday", time: "7:00 AM – 9:00 PM" },
    { day: "Sunday", time: "8:00 AM – 8:00 PM" },
  ],
  socials: ["Instagram", "TikTok", "YouTube", "X"],
};
