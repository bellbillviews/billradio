import { Show } from "@/components/ShowCard";

// Placeholder shows - will be replaced with user-provided content or Supabase data
export const shows: Show[] = [
  {
    id: "1",
    name: "Morning Rise",
    host: "DJ Bello",
    description: "Start your day with the freshest Afrobeats, highlife classics, and uplifting conversations to power your morning.",
    schedule: "Mon - Fri",
    time: "6:00 AM - 10:00 AM",
  },
  {
    id: "2",
    name: "Afternoon Drive",
    host: "Amara & Chidi",
    description: "Your midday companion featuring trending topics, celebrity interviews, and the hottest tracks keeping you company till evening.",
    schedule: "Mon - Fri",
    time: "2:00 PM - 6:00 PM",
  },
  {
    id: "3",
    name: "Evening Vibes",
    host: "Lady K",
    description: "Wind down with smooth R&B, soulful conversations, and listener dedications as the city lights come alive.",
    schedule: "Mon - Sun",
    time: "7:00 PM - 10:00 PM",
  },
  {
    id: "4",
    name: "Weekend Splash",
    host: "MC Thunder",
    description: "Non-stop party mix bringing you the best of African music, from Amapiano to Naija pop, all weekend long.",
    schedule: "Sat - Sun",
    time: "12:00 PM - 6:00 PM",
  },
];
