let searchTerm = "";
let currentCategory = "";
let recipeRatings = JSON.parse(localStorage.getItem('recipeRatings')) || {};

document.addEventListener("DOMContentLoaded", () => {
    const recipeContainer = document.querySelector(".recipe-container");
    const searchBtn = document.getElementById("search-btn");
    const searchInput = document.querySelector(".searchCard");
    const categoryButtonsContainer = document.querySelector(".category-buttons");
    
    searchBtn.addEventListener("click", handleSearch);

    fetchCategories();
    fetchRecipes("soup");

    async function fetchCategories() {
        try {
            const response = await fetch("https://www.themealdb.com/api/json/v1/1/list.php?c=list");
            const data = await response.json();
            if (data.meals) showCategories(data.meals);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    function showCategories(categories) {
        const allButton = document.createElement("button");
        allButton.textContent = "All";
        allButton.className = "category-btn active";
        allButton.addEventListener("click", () => {
            document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("active"));
            allButton.classList.add("active");
            currentCategory = "";
            fetchRecipes(searchTerm || "soup");
        });
        categoryButtonsContainer.appendChild(allButton);

        categories.forEach(category => {
            const button = document.createElement("button");
            button.textContent = category.strCategory;
            button.className = "category-btn";
            button.addEventListener("click", () => {
                document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");
                currentCategory = category.strCategory;
                if (searchTerm) fetchRecipes(searchTerm);
                else fetchRecipesByCategory(currentCategory);
            });
            categoryButtonsContainer.appendChild(button);
        });
    }

    async function fetchRecipesByCategory(category) {
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
            const data = await response.json();
            recipeContainer.innerHTML = "";
            
            if (data.meals) {
                const recipePromises = data.meals.map(meal => 
                    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
                        .then(res => res.json())
                );
                const recipes = await Promise.all(recipePromises);
                recipes.forEach(recipe => showRecipe(recipe.meals[0]));
            } else {
                recipeContainer.innerHTML = "<p>No recipes found in this category.</p>";
            }
        } catch (error) {
            console.error("Error fetching recipes by category:", error);
            recipeContainer.innerHTML = "<p>Loading recipes failed. Try later.</p>";
        }
    }

    async function fetchRecipes(query) {
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
            const data = await response.json();
            recipeContainer.innerHTML = "";
            
            if (data.meals) {
                let filteredMeals = data.meals;
                if (currentCategory) {
                    filteredMeals = data.meals.filter(meal => meal.strCategory === currentCategory);
                }
                
                if (filteredMeals.length > 0) {
                    filteredMeals.forEach(recipe => showRecipe(recipe));
                } else {
                    recipeContainer.innerHTML = `<p>No recipes found for "${query}" in ${currentCategory} category.</p>`;
                }
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
        
        const currentRating = recipeRatings[recipe.idMeal] || 0;
        const starsHTML = Array(5).fill().map((_, i) => 
            `<span class="recipe-star" data-value="${i+1}" data-recipe="${recipe.idMeal}">${i+1 <= currentRating ? '★' : '☆'}</span>`
        ).join('');
        
        recipeCard.innerHTML = `
            <img src="${recipe.strMealThumb}/preview" alt="${recipe.strMeal}">    
            <h3>${recipe.strMeal}</h3>
            <div class="recipe-rating">${starsHTML}</div>
            <p>Category: ${recipe.strCategory}</p>
        `;
        
        const button = document.createElement("button");
        button.className = "view-btn";
        button.textContent = "See Recipe";
        button.addEventListener("click", () => fetchRecipeDetails(recipe.idMeal));
        
        recipeCard.appendChild(button);
        recipeContainer.appendChild(recipeCard);
        
        recipeCard.querySelectorAll('.recipe-star').forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.value);
                const recipeId = e.target.dataset.recipe;
                recipeRatings[recipeId] = rating;
                localStorage.setItem('recipeRatings', JSON.stringify(recipeRatings));
                showRecipe(recipe);
            });
        });
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
        
        const currentRating = recipeRatings[recipe.idMeal] || 0;
        const starsHTML = Array(5).fill().map((_, i) => 
            `<span class="recipe-star" data-value="${i+1}" data-recipe="${recipe.idMeal}">${i+1 <= currentRating ? '★' : '☆'}</span>`
        ).join('');
        
        recipeContainer.innerHTML = `
            <div class="recipe-details">
                <h2>${recipe.strMeal}</h2>
                <img src="${recipe.strMealThumb}/preview" alt="${recipe.strMeal}">
                <div class="recipe-rating">Rating: ${starsHTML}</div>
                <h3>Ingredients:</h3>
                <ul>${ingredients.map(ing => `<li>${ing}</li>`).join("")}</ul>
                <h3>Instructions:</h3>
                <p>${recipe.strInstructions}</p>
                <button id="back-btn">Back to Recipes</button>
            </div>
        `;

        document.getElementById("back-btn").addEventListener("click", () => fetchRecipes(searchTerm || "soup"));
        
        document.querySelectorAll('.recipe-star').forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.value);
                const recipeId = e.target.dataset.recipe;
                recipeRatings[recipeId] = rating;
                localStorage.setItem('recipeRatings', JSON.stringify(recipeRatings));
                showRecipeDetails(recipe);
            });
        });
    }

    function handleSearch(e) {
        e.preventDefault();
        searchTerm = searchInput.value.trim();
        if (searchTerm) fetchRecipes(searchTerm);
    }

    // Footer Feedback System
    const footer = document.createElement("footer");
    footer.innerHTML = `
        <div class="feedback-section">
            <h3>Rate Our App</h3>
            <div class="app-rating-stars">
                <span class="app-star" data-value="1">★</span>
                <span class="app-star" data-value="2">★</span>
                <span class="app-star" data-value="3">★</span>
                <span class="app-star" data-value="4">★</span>
                <span class="app-star" data-value="5">★</span>
            </div>
            <textarea placeholder="Your feedback about the app..."></textarea>
            <button id="submit-feedback">Submit Feedback</button>
            <div class="feedback-message"></div>
        </div>
    `;
    document.body.appendChild(footer);

    const appStars = document.querySelectorAll(".app-star");
    const feedbackTextarea = document.querySelector(".feedback-section textarea");
    const submitBtn = document.getElementById("submit-feedback");
    const feedbackMessage = document.querySelector(".feedback-message");
    
    let appRating = 0;
    
    appStars.forEach(star => {
        star.addEventListener("click", () => {
            appRating = parseInt(star.dataset.value);
            appStars.forEach(s => {
                s.style.color = parseInt(s.dataset.value) <= appRating ? "gold" : "#ccc";
            });
        });
    });
    
    submitBtn.addEventListener("click", () => {
        const feedback = feedbackTextarea.value.trim();
        
        if (!appRating) {
            feedbackMessage.textContent = "Please select a rating";
            feedbackMessage.style.color = "red";
            return;
        }
        
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;
        
        setTimeout(() => {
            feedbackMessage.textContent = "Thank you for your feedback!";
            feedbackMessage.style.color = "lightgreen";
            submitBtn.textContent = "Submit Feedback";
            submitBtn.disabled = false;
            
            appStars.forEach(s => s.style.color = "#ccc");
            feedbackTextarea.value = "";
            appRating = 0;
            
            setTimeout(() => {
                feedbackMessage.textContent = "";
            }, 5000);
        }, 2000);
    });
});