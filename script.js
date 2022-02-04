const movies = document.querySelector('.movies');
const nav = document.querySelector('.nav');
const selectYear = document.querySelector('.select-year');
const selectGenre = document.querySelector('.select-genre');
const selects = document.querySelectorAll('select');
const menu = document.querySelector('#menu');
const burgerMenu = document.querySelector('#burger-menu');
const overlay = document.querySelector('#menu');
const roller = document.querySelector('.loader');
let movieCart = [];

// years filter options
function generateYearOptions(year) {
        const currentYear = new Date().getFullYear();
        const minYear = 1960;
        for (let i = currentYear - 1; i >= minYear; i -= 1) {
                selectYear.innerHTML += `<option value='${i}'>${i}</option>`;
        }
        selectYear.value = year;
}

// get genre data
async function fetchGenre() {
        try {
                const res = await fetch('https://data-imdb1.p.rapidapi.com/genres/', {
                        method: 'GET',
                        headers: {
                                'x-rapidapi-host': 'data-imdb1.p.rapidapi.com',
                                'x-rapidapi-key': '12d729d79cmsh0565db45c95d5d5p1a6783jsn3ba32e76ca2b',
                        },
                });
                if (!res.ok) throw new Error('Genre data problem');
                const genresData = await res.json();
                const genres = genresData.results.map(({ genre }) => genre);
                return genres.map((genre) => `<option value='${genre}'>${genre}</option>`).join('');
        } catch (err) {
                renderError(err.message);
        }
}
//  genres filter options
async function generateGenreOptions(genre) {
        try {
                selectGenre.innerHTML = await fetchGenre();
                selectGenre.value = genre;
        } catch (err) {
                renderError(err.message);
        }
}
// get ids of movies
async function fetchData(year, genre) {
        try {
                generateGenreOptions(genre);
                generateYearOptions(year);
                const res = await fetch(`https://data-imdb1.p.rapidapi.com/movie/byYear/${year}/byGen/${genre}/`, {
                        method: 'GET',
                        headers: {
                                'x-rapidapi-host': 'data-imdb1.p.rapidapi.com',
                                'x-rapidapi-key': '12d729d79cmsh0565db45c95d5d5p1a6783jsn3ba32e76ca2b',
                        },
                });
                if (!res.ok) throw new Error('Movie data problem');
                const moviesData = await res.json();
                const ids = moviesData.results.map((id) => id.imdb_id);

                return ids;
        } catch (err) {
                renderError(err.message);
        }
}
//  use ids and display movies
async function displayMovie(year = '2020', genre = 'Comedy') {
        const ids = await fetchData(year, genre);
        loader();
        // console.log(ids);
        ids.forEach(async (id) => {
                const res = await fetch(`https://data-imdb1.p.rapidapi.com/movie/id/${id}/`, {
                        method: 'GET',
                        headers: {
                                'x-rapidapi-host': 'data-imdb1.p.rapidapi.com',
                                'x-rapidapi-key': '12d729d79cmsh0565db45c95d5d5p1a6783jsn3ba32e76ca2b',
                        },
                });

                if (!res.ok) throw new Error('ID data problem');

                const movie = (await res.json()).results;
                const { banner, title, rating, plot, imdb_id } = movie;
                // helper statement 404 error
                if (rating === 0) {
                        return;
                }
                const html = ` 
<diV class="movie" >
    <div class="img-wrapper" style="background-image: url('${banner}');">
   
      <p class="plot">${plot}</p>
      <button class="button" id="${imdb_id}">Add to Watchlist</button>
    </div>
    <div class="title">${title}</div>
</div>`;

                movies.innerHTML += html;
        });
}
displayMovie();

// options handler
function filterHandler() {
        movies.innerHTML = '';
        displayMovie(selectYear.value, selectGenre.value);
}

// filter event listner
selects.forEach((select) => {
        select.addEventListener('input', filterHandler);
});
// add film to watchlist
async function btnClick(e) {
        try {
                if (e.target.classList.contains('button')) {
                        const res = await fetch(`https://data-imdb1.p.rapidapi.com/movie/id/${e.target.id}/`, {
                                method: 'GET',
                                headers: {
                                        'x-rapidapi-host': 'data-imdb1.p.rapidapi.com',
                                        'x-rapidapi-key': '12d729d79cmsh0565db45c95d5d5p1a6783jsn3ba32e76ca2b',
                                },
                        });
                        if (!res.ok) throw new Error('Cart data problem');
                        const movieData = (await res.json()).results;

                        movieCart.push(movieData);
                        const uniqueObjArray = [...new Map(movieCart.map((item) => [item.imdb_id, item])).values()];
                        movieCart = uniqueObjArray;
                        const html = movieCart
                                .map(
                                        (movie) =>
                                                ` 
<diV class="movie-menu">
<img class="img-menu" src="${movie.image_url}" alt="${movie.title}">  
<button class="cart-button" value="${movie.imdb_id}">Delete</button>
</div>`
                                )
                                .join('');

                        menu.innerHTML = html;
                        mirronToLocalStorage();
                }
        } catch (err) {
                renderError(err.message);
        }
}
// localStorage setting
function mirronToLocalStorage() {
        localStorage.setItem('movieCart', JSON.stringify(movieCart));
}
// localStorage setting
function restoreFromLocalStorage() {
        const storage = JSON.parse(localStorage.getItem('movieCart'));
        if (!storage) return;
        if (storage.length) {
                movieCart = storage;
                const html = movieCart
                        .map(
                                (movie) => ` 
<diV class="movie-menu">
<img class="img-menu" src="${movie.image_url}" alt="${movie.title}">  
<button class="cart-button" value="${movie.imdb_id}">Delete</button>
</div>`
                        )
                        .join('');

                menu.innerHTML = html;
        }
}
// remove from watchlist
function deleteFromCart(e) {
        if (e.target.classList.contains('cart-button')) {
                const id = e.target.value;
                movieCart = movieCart.filter((movie) => movie.imdb_id !== id);
                const html = movieCart
                        .map(
                                (movie) => ` 
<diV class="movie-menu">
<img class="img-menu" src="${movie.image_url}" alt="${movie.title}">  
<button class="cart-button" value="${movie.imdb_id}">Delete</button>
</div>`
                        )
                        .join('');

                menu.innerHTML = html;

                mirronToLocalStorage();
        }
}

menu.addEventListener('click', deleteFromCart);
movies.addEventListener('click', btnClick);
restoreFromLocalStorage();

burgerMenu.addEventListener('click', function () {
        this.classList.toggle('close');
        overlay.classList.toggle('overlay');
        document.querySelector('#main').classList.toggle('modal-outer');
        selects.forEach((select) => select.classList.toggle('modal-outer'));
        document.querySelector('body').classList.toggle('overflow');
});

function renderError(msg) {
        movies.innerText = msg;
}
// helper function
function wait(ms = 0) {
        return new Promise((resolve) => {
                setTimeout(resolve, ms);
        });
}

async function loader() {
        roller.classList.remove('hidden');
        nav.classList.add('hidden');
        movies.classList.add('hidden');
        await wait(2000);
        roller.classList.add('hidden');
        nav.classList.remove('hidden');
        nav.style.display = 'flex';
        movies.classList.remove('hidden');
}
