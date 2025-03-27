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

    //getting recipes
    function showRecipe(recipe) { 
        const recipeCard = document.createElement("div");
        recipeCard.className = "recipe-card";
        recipeCard.innerHTML = `
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">    
            <h3>${recipe.strMeal}</h3> 
            <p>Category: ${recipe.strCategory}</p>
        `;
        const button = document.createElement("button")
        button.className="view-btn";
        button.textContent = "See Recipe";

        recipeCard.appendChild(button)
        button.addEventListener("click", () =>{
            showRecipe(recipe.idMeal)
        })
        recipeContainer.appendChild(recipeCard);
    }

    function handleSearch(e) {
        e.preventDefault();
        searchTerm = searchInput.value.trim();
        if (searchTerm) {  
            fetchRecipes(searchTerm);
        }
    }
});