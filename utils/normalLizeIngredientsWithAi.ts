import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-hot-toast";

interface Ingredient {
  name: string;
  quantity: number | string;
  unit: string;
  category?: string;
}

export const normalizeIngredientsWithAI = async (
  ingredients: string[]
): Promise<{[key: string]: string}> => {
  if (!ingredients || ingredients.length === 0) {
    toast.error("No ingredients to normalize");
    return {};
  }

  const loadingToastId = toast.loading("Normalizing ingredients...");

  try {
    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
I have a list of ingredients from recipes that need to be normalized. I need you to identify duplicate ingredients (including plural forms, variations in description, etc.) and create a mapping object in JavaScript/TypeScript.

The format should be a plain JSON object:
{
  "original ingredient name": "normalized name",
  ...
}

Some rules:
1. Normalize to singular form when possible (e.g., "eggs" → "egg")
2. Remove descriptive text in parentheses, but keep important distinctions
3. Group similar items (e.g., "tomato paste" should be separate from "canned tomatoes")
4. Group items with the same base ingredient but different preparations (e.g., "garlic, minced" and "garlic powder" should be separate)
5. Ingredients with completely different purposes should remain separate
6. Different types of oils can be grouped (e.g., "olive oil" and "vegetable oil" → "cooking oil")
7. Use the most common/generic name as the normalized value

Here's the list of ingredients to normalize:
${JSON.stringify(ingredients)}

Important: Return ONLY the JSON object itself, with NO code block formatting, NO backticks, and NO explanation text.
`;

    // Generate the ingredient mapping
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    
    try {
      // First try: Direct parsing if the response is already clean
      try {
        const mapping = JSON.parse(responseText);
        toast.success("Ingredients normalized successfully!", {
          id: loadingToastId,
          duration: 3000
        });
        return mapping;
      } catch (directParseError) {
        console.log("Direct parsing failed, trying cleanup methods");
      }
      
      // Second try: Extract JSON object from markdown code block
      const jsonMatch = responseText.match(/```(?:javascript|json|typescript)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const mapping = JSON.parse(jsonMatch[1]);
          console.log("Normalized ingredients mapping (code block extraction):", mapping);
          toast.success("Ingredients normalized successfully!", {
            id: loadingToastId,
            duration: 3000
          });
          return mapping;
        } catch (blockParseError) {
          console.log("Code block extraction failed");
        }
      }
      
      // Third try: More aggressive cleanup of the entire text
      let jsonText = responseText;
      // Remove all backtick blocks completely
      jsonText = jsonText.replace(/```[\s\S]*?```/g, '');
      // Remove any remaining backticks
      jsonText = jsonText.replace(/```/g, '');
      // Find anything that looks like a JSON object
      const objectMatch = jsonText.match(/(\{[\s\S]*\})/);
      if (objectMatch && objectMatch[1]) {
        try {
          const mapping = JSON.parse(objectMatch[1]);
          // console.log("Normalized ingredients mapping (aggressive cleanup):", mapping);
          toast.success("Ingredients normalized successfully!", {
            id: loadingToastId,
            duration: 3000
          });
          return mapping;
        } catch (cleanupError) {
          console.log("Aggressive cleanup failed");
        }
      }
      
      // Fourth try: Manual line-by-line parsing as last resort
      const manualMapping: {[key: string]: string} = {};
      const lines = responseText.split('\n');
      
      // Skip lines with backticks
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.includes('```')) continue;
        
        // Match "key": "value" pattern
        const match = line.match(/"([^"]+)":\s*"([^"]+)"(,?)$/);
        if (match) {
          manualMapping[match[1]] = match[2];
        }
      }
      
      if (Object.keys(manualMapping).length > 0) {
        console.log("Created manual mapping:", manualMapping);
        toast.success("Ingredients normalized with fallback method", {
          id: loadingToastId,
          duration: 3000
        });
        return manualMapping;
      }
      
      // If all parsing attempts fail
      console.error("All JSON parsing attempts failed");
      toast.error("Could not parse the normalized ingredients", {
        id: loadingToastId
      });
      
      // Provide a basic normalization as fallback
      return createBasicNormalization(ingredients);
      
    } catch (error) {
      console.error("Error processing AI response:", error);
      toast.error("Error processing ingredient normalization", {
        id: loadingToastId
      });
      return createBasicNormalization(ingredients);
    }
  } catch (error) {
    console.error("Error normalizing ingredients:", error);
    // toast.error("Failed to normalize ingredients. Please try again later.", {
    //   id: loadingToastId
    // });
    return createBasicNormalization(ingredients);
  }
};

// Create a basic normalization map as fallback
const createBasicNormalization = (ingredients: string[]): {[key: string]: string} => {
  const mapping: {[key: string]: string} = {};
  
  // Apply basic normalization rules
  ingredients.forEach(ingredient => {
    // Convert to lowercase
    const normalized = ingredient.toLowerCase();
    
    // Simple plural handling
    if (normalized.endsWith('s') && 
        normalized.length > 2 && 
        !['gas', 'bass', 'grass', 'swiss', 'mass'].includes(normalized)) {
      mapping[ingredient] = normalized.slice(0, -1);
    } else {
      mapping[ingredient] = normalized;
    }
    
    // Handle common prefixes
    if (normalized.startsWith('fresh ')) {
      mapping[ingredient] = normalized.substring(6);
    }
  });
  
  // Add manual mappings for common cases
  const manualMappings: {[key: string]: string} = {
    "black pepper": "black pepper",
    "Black Pepper": "black pepper",
    "Salt": "salt",
    "salt": "salt",
    "Egg": "egg",
    "Eggs": "egg",
    "Olive Oil": "cooking oil",
    "Vegetable oil": "cooking oil", 
    "vegetable oil": "cooking oil"
  };
  
  return {...mapping, ...manualMappings};
};

// Function to categorize normalized ingredients
export const categorizeIngredient = (name: string): string => {
  name = name.toLowerCase();
  
  if (/apple|banana|berry|fruit|vegetable|lettuce|tomato|onion|potato|carrot|pepper|cucumber|broccoli|spinach|kale|garlic|herbs|basil/i.test(name)) {
    return 'Produce';
  }
  if (/beef|chicken|pork|lamb|turkey|meat|fish|salmon|shrimp|seafood/i.test(name)) {
    return 'Meat & Seafood';
  }
  if (/milk|cheese|yogurt|butter|cream|egg|dairy/i.test(name)) {
    return 'Dairy & Eggs';
  }
  if (/bread|bagel|bun|roll|bakery|pastry|croissant|cake/i.test(name)) {
    return 'Bakery';
  }
  if (/flour|sugar|rice|pasta|cereal|grain|bean|lentil|nut|seed|coffee/i.test(name)) {
    return 'Pantry';
  }
  if (/can|canned|soup|bean|tomato sauce|broth/i.test(name)) {
    return 'Canned Goods';
  }
  if (/frozen|ice cream|pizza|fries/i.test(name)) {
    return 'Frozen Foods';
  }
  if (/salt|pepper|spice|cumin|ginger|paprika|herb|sauce|oil|vinegar|condiment|mayo|ketchup|mustard/i.test(name)) {
    return 'Condiments & Spices';
  }
  
  return 'Other';
};

// Function to apply the normalization mapping to ingredients
export const applyIngredientNormalization = (
  ingredients: Ingredient[],
  normalizationMap: {[key: string]: string}
): Ingredient[] => {
  return ingredients.map(ing => {
    const normalizedName = normalizationMap[ing.name] || ing.name;
    return {
      ...ing,
      name: normalizedName,
      category: ing.category || categorizeIngredient(normalizedName)
    };
  });
};