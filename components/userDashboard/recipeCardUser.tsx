import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Recipe = {
  id: string;
  title: string;
  image: string;
  prepTime: number;
  difficulty: string;
  cuisine: string;
};

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <Link href={`/recipes/${recipe.id}`}>
      <div className="bg-white overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer h-full flex flex-col">
        <div className="relative h-36 w-full">
          <Image 
            src={recipe.image} 
            alt={recipe.title}
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute bottom-0 right-0 bg-white px-2 py-1 text-xs font-medium rounded-tl-md">
            {recipe.prepTime} min
          </div>
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-bold text-gray-800 mb-1">{recipe.title}</h3>
          <div className="flex items-center mt-auto">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full mr-2">
              {recipe.difficulty}
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {recipe.cuisine}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;