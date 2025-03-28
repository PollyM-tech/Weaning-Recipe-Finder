let searchTerm = "";

document.addEventListener("DOMContentLoaded", () => {
    const recipeContainer = document.querySelector(".recipe-container");
    const searchBtn = document.getElementById("search-btn");
    const searchInput = document.querySelector(".searchCard");
   
    searchBtn.addEventListener("click", handleSearch);

    fetchRecipes("soup"); 

    async function fetchRecipes(query) {
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
            const data = await response.json();
            
            recipeContainer.innerHTML = "";
            
            if (data.meals) {
                data.meals.forEach(recipe => showRecipe(recipe));
            } else {
                recipeContainer.innerHTML = "<p>No recipes found. Try another term!</p>";
            }
        } catch (error) {
            console.error("Error fetching recipes:", error);
            recipeContainer.innerHTML = "<p>Loading recipes failed. Try later.</p>";
        }
    }

    function showRecipe(recipe) { 
        const recipeCard = document.createElement("div");
        recipeCard.className = "recipe-card";
        recipeCard.innerHTML = `
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">    
            <h3>${recipe.strMeal}</h3> 
            <p>Category: ${recipe.strCategory}</p>
        `;
        const button = document.createElement("button");
        button.className = "view-btn";
        button.textContent = "See Recipe";

        button.addEventListener("click", () => {
            fetchRecipeDetails(recipe.idMeal);
        });

        recipeCard.appendChild(button);
        recipeContainer.appendChild(recipeCard);
    }

    async function fetchRecipeDetails(id) {
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
            const data = await response.json();
            showRecipeDetails(data.meals[0]);
        } catch(error) {
            console.error("404:", error);
        }
    }

    function showRecipeDetails(recipe) {
        const ingredients = [];
        for(let i = 1; i <= 20; i++) {
            if (recipe[`strIngredient${i}`]) {
                ingredients.push(`${recipe[`strIngredient${i}`]} - ${recipe[`strMeasure${i}`]}`);
            }
        }
        
        recipeContainer.innerHTML = `
            <div class="recipe-details">
                <h2>${recipe.strMeal}</h2>
                <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
                <h3>Ingredients:</h3>
                <ul>${ingredients.map(ing => `<li>${ing}</li>`).join("")}</ul>
                <h3>Instructions:</h3>
                <p>${recipe.strInstructions}</p>
                <button id="back-btn">Back to Recipes</button>
            </div>
        `;

        //styling back-button
        const backBtn = document.getElementById("back-btn")
        backBtn.style.backgroundColor = "#4285f4";
        backBtn.style.color="white";
        backBtn.style.border = "none";
        backBtn.style.padding = "10px 16px";
        backBtn.style.borderRadius = "8px";
        backBtn.style.fontSize = "14px";
        backBtn.style.cursor = "pointer";
        backBtn.style.marginTop = "20px";

        backBtn.addEventListener("click", () => fetchRecipes(searchTerm || "soup"))

        document.getElementById("back-btn").addEventListener("click", () => fetchRecipes(searchTerm || "soup"));
    }

    function handleSearch(e) {
        e.preventDefault();
        searchTerm = searchInput.value.trim();
        if (searchTerm) {  
            fetchRecipes(searchTerm);
        }
    }
});