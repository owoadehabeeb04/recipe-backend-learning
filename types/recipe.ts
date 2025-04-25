
// Recipe type definition
export interface Recipe {
  _id: string;
  title: string;
  category: string;
  cookingTime: number;
  difficulty: string;
  featuredImage: string;
  averageRating: number;
  adminName: string;
  createdAt: string;
  isPublished?: boolean;
  adminDetails?: {
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  };
  isFavorited?: boolean; // Track if recipe is favorited
  recipe: {
    _id: string;
    title: string;
    category: string;
    cookingTime: number;
    difficulty: string;
    featuredImage: string;
    averageRating: number;
    adminName: string;
    createdAt: string;
    isPublished?: boolean;
    adminDetails?: {
      name: string;
      email: string;
      role: string;
      profileImage?: string;
    };
    isFavorited?: boolean; // Track if recipe is favorited
  }
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number;
  fiber?: number;
  sodium?: number;
}

export interface Ingredient {
  quantity: string;
  unit: string;
  name: string;
}
// export const sampleRecipes: Recipe[] = [
//   {
//     id: "1",
//     title: "Spicy Thai Basil Chicken",
//     category: "dinner",
//     cookingTime: 25,
//     difficulty: "medium",
//     featuredImage:
//       "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
//     averageRating: 4.7,
//     isPublished: true,
//     createdAt: "2023-10-15T14:48:00.000Z"
//   },
//   {
//     id: "2",
//     title: "Blueberry Pancakes",
//     category: "breakfast",
//     cookingTime: 20,
//     difficulty: "easy",
//     featuredImage:
//       "https://images.unsplash.com/photo-1565299543923-37dd37887442?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
//     averageRating: 4.5,
//     isPublished: true,
//     createdAt: "2023-10-12T08:30:00.000Z"
//   },
//   {
//     id: "3",
//     title: "Homemade Pizza Dough",
//     category: "dinner",
//     cookingTime: 90,
//     difficulty: "hard",
//     featuredImage:
//       "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
//     averageRating: 4.2,
//     isPublished: false,
//     createdAt: "2023-10-08T16:20:00.000Z"
//   },
//   {
//     id: "4",
//     title: "Chocolate Lava Cake",
//     category: "dessert",
//     cookingTime: 30,
//     difficulty: "medium",
//     featuredImage:
//       "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
//     averageRating: 4.9,
//     isPublished: true,
//     createdAt: "2023-09-29T19:15:00.000Z"
//   },
//   {
//     id: "5",
//     title: "Green Smoothie Bowl",
//     category: "breakfast",
//     cookingTime: 10,
//     difficulty: "easy",
//     featuredImage:
//       "https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
//     averageRating: 4.1,
//     isPublished: true,
//     createdAt: "2023-10-02T07:45:00.000Z"
//   }
// ];
