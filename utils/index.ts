// Recipe type definition
interface Recipe {
  id: string;
  title: string;
  category: string;
  cookingTime: number;
  difficulty: string;
  featuredImage: string;
  averageRating: number;
  adminName: string;
  createdAt: string;
}
export const categoryOptions = [
  "breakfast",
  "lunch",
  "dinner",
  "dessert",
  "snack",
"beverage",
];
// Sample data - replace with actual API call
export const sampleRecipes: Recipe[] = [
  {
    id: "1",
    title: "Spicy Thai Basil Chicken",
    category: "dinner",
    cookingTime: 25,
    difficulty: "medium",
    featuredImage:
      "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    averageRating: 4.7,
    adminName: "Chef Mike",
    createdAt: "2023-10-15T14:48:00.000Z"
  },
  {
    id: "2",
    title: "Blueberry Pancakes",
    category: "breakfast",
    cookingTime: 20,
    difficulty: "easy",
    featuredImage:
      "https://images.unsplash.com/photo-1565299543923-37dd37887442?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    averageRating: 4.5,
    adminName: "Breakfast King",
    createdAt: "2023-10-12T08:30:00.000Z"
  },
  {
    id: "3",
    title: "Homemade Pizza Dough",
    category: "dinner",
    cookingTime: 90,
    difficulty: "hard",
    featuredImage:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    averageRating: 4.2,
    adminName: "Pizza Master",
    createdAt: "2023-10-08T16:20:00.000Z"
  },
  {
    id: "4",
    title: "Chocolate Lava Cake",
    category: "dessert",
    cookingTime: 30,
    difficulty: "medium",
    featuredImage:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    averageRating: 4.9,
    adminName: "Dessert Queen",
    createdAt: "2023-09-29T19:15:00.000Z"
  },
  {
    id: "5",
    title: "Green Smoothie Bowl",
    category: "breakfast",
    cookingTime: 10,
    difficulty: "easy",
    featuredImage:
      "https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    averageRating: 4.1,
    adminName: "Healthy Eats",
    createdAt: "2023-10-02T07:45:00.000Z"
  },
  {
    id: "6",
    title: "Classic Beef Burger",
    category: "lunch",
    cookingTime: 35,
    difficulty: "medium",
    featuredImage:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    averageRating: 4.6,
    adminName: "Burger Pro",
    createdAt: "2023-09-25T12:30:00.000Z"
  },
  {
    id: "7",
    title: "Vegetable Stir Fry",
    category: "dinner",
    cookingTime: 15,
    difficulty: "easy",
    featuredImage:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    averageRating: 4.3,
    adminName: "Veggie Lover",
    createdAt: "2023-10-05T18:15:00.000Z"
  },
  {
    id: "8",
    title: "Homemade Pasta Carbonara",
    category: "dinner",
    cookingTime: 40,
    difficulty: "medium",
    featuredImage:
      "https://images.unsplash.com/photo-1588013273468-315fd88ea34c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    averageRating: 4.8,
    adminName: "Pasta Master",
    createdAt: "2023-10-10T19:20:00.000Z"
  }
];