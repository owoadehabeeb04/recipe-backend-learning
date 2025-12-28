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
      <div className="bg-card overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer h-full flex flex-col border border-border">
        <div className="relative h-32 sm:h-36 w-full">
          <Image 
            src={recipe.image} 
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute bottom-0 right-0 bg-card px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-tl-md">
            {recipe.prepTime} min
          </div>
        </div>
        <div className="p-3 sm:p-4 flex-grow flex flex-col">
          <h3 className="font-bold text-foreground mb-1 text-sm sm:text-base line-clamp-2">{recipe.title}</h3>
          <div className="flex items-center mt-auto flex-wrap gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-xs bg-muted text-muted-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
              {recipe.difficulty}
            </span>
            <span className="text-[10px] sm:text-xs bg-muted text-muted-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
              {recipe.cuisine}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;