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

        const backBtn = document.getElementById("back-btn");
        backBtn.style.backgroundColor = "#4285f4";
        backBtn.style.color = "white";
        backBtn.style.border = "none";
        backBtn.style.padding = "10px 20px";
        backBtn.style.borderRadius = "5px";
        backBtn.style.fontSize = "16px";
        backBtn.style.cursor = "pointer";
        backBtn.style.marginTop = "20px";
        backBtn.addEventListener("click", () => fetchRecipes(searchTerm || "soup"));
    }

    function handleSearch(e) {
        e.preventDefault();
        searchTerm = searchInput.value.trim();
        if (searchTerm) {  
            fetchRecipes(searchTerm);
        }
    }

    const footer = document.createElement("footer");
    footer.innerHTML = `
        <div class="feedback-section">
            <h3>Rate Our Recipes</h3>
            <div class="rating-stars">
                <span class="star" data-value="1">★</span>
                <span class="star" data-value="2">★</span>
                <span class="star" data-value="3">★</span>
                <span class="star" data-value="4">★</span>
                <span class="star" data-value="5">★</span>
            </div>
            <textarea placeholder="Your feedback..."></textarea>
            <button id="submit-feedback">Submit Feedback</button>
            <div class="feedback-message"></div>
        </div>
    `;
    document.body.appendChild(footer);

    const style = document.createElement("style");
    style.textContent = `
        footer {
            background-color: #360101;
            padding: 20px;
            color: #FFD6EC;
            margin-top: 40px;
        }
        .feedback-section {
            max-width: 600px;
            margin: 0 auto;
            text-align: center;
        }
        .rating-stars {
            font-size: 24px;
            margin: 10px 0;
        }
        .star {
            color: #FFD6EC;
            cursor: pointer;
            transition: color 0.2s;
        }
        .star:hover, .star.active {
            color: gold;
        }
        textarea {
            width: 100%;
            padding: 10px;
            border-radius: 10px;
            margin: 10px 0;
            min-height: 40px;
        }
        #submit-feedback {
            background-color:rgb(59, 130, 245);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s;
        }
        #submit-feedback:hover {
            background-color:rgb(94, 111, 146);
            transform: translateY(-2px);
        }
        .feedback-message {
            margin-top: 8px;
            min-height: 15px;
        }
        @media (max-width: 680px) {
            .rating-stars {
                font-size: 20px;
            }
            #submit-feedback {
                padding: 8px 16px;
                font-size: 14px;
            }
        }
    `;
    document.head.appendChild(style);

    const stars = document.querySelectorAll(".star");
    const feedbackTextarea = document.querySelector(".feedback-section textarea");
    const submitBtn = document.getElementById("submit-feedback");
    const feedbackMessage = document.querySelector(".feedback-message");
    
    let selectedRating = 0;
    
    stars.forEach(star => {
        star.addEventListener("click", () => {
            selectedRating = parseInt(star.dataset.value);
            stars.forEach(s => {
                s.classList.toggle("active", parseInt(s.dataset.value) <= selectedRating);
            });
        });
        
        star.addEventListener("mouseover", () => {
            if (!selectedRating) {
                const value = parseInt(star.dataset.value);
                stars.forEach(s => {
                    s.style.color = parseInt(s.dataset.value) <= value ? "gold" : "#555";
                });
            }
        });
        
        star.addEventListener("mouseout", () => {
            if (!selectedRating) {
                stars.forEach(s => {
                    s.style.color = "#555";
                });
            }
        });
    });
    
    submitBtn.addEventListener("click", () => {
        const feedback = feedbackTextarea.value.trim();
        
        if (!selectedRating) {
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
            
            stars.forEach(s => s.classList.remove("active"));
            feedbackTextarea.value = "";
            selectedRating = 0;
            
            setTimeout(() => {
                feedbackMessage.textContent = "";
            }, 3000);
        }, 1000);
    });
});