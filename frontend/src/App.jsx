import { useEffect, useState } from 'react';
import { getRecipes } from './services/recipeApi';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRecipes() {
      try {
        const data = await getRecipes();
        setRecipes(data);
      } catch (err) {
        setError(err.message);
      }
    }

    loadRecipes();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <h1>Recipes</h1>

      {recipes.map((recipe) => (
        <article key={recipe._id}>
          <h2>{recipe.title}</h2>
        </article>
      ))}
    </main>
  );
}

export default App;