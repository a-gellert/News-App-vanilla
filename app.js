// Custom Http Module
function customHttp() {
    return {
        get(url, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                xhr.send();
            } catch (error) {
                cb(error);
            }
        },
        post(url, body, headers, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                if (headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                        xhr.setRequestHeader(key, value);
                    });
                }

                xhr.send(JSON.stringify(body));
            } catch (error) {
                cb(error);
            }
        },
    };
}
//Elements

const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const categorySelect = form.elements['category'];
const searchInput = form.elements['search'];

form.addEventListener('submit', e => {
    e.preventDefault();
    loadNews();
});

// Init http module
const http = customHttp();

const newsService = (function () {
    const apiKey = 'c1a47377a22d4f819ef8903e00f483fb';
    const apiUrl = 'http://newsapi.org/v2';
    return {
        topHeadlines(country = 'ru', category = 'general', cb) {
            http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`, cb)
        },
        everything(query, cb) {
            http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb)
        }
    }
})();

//  init selects
document.addEventListener('DOMContentLoaded', function () {
    M.AutoInit();
    loadNews();
});
function loadNews() {
    showLoader();
    const country = countrySelect.value;
    const category = categorySelect.value;
    const search = searchInput.value;
    if (!search) {
        newsService.topHeadlines(country, category, onGetResponse);
    } else {
        newsService.everything(search, onGetResponse);
    }
}
function onGetResponse(err, res) {
    removeLoader();
    if (err) {
        showMessage(err, 'error-msg');
        return;
    }
    if (!res.articles.length) {
        showMessage('No news')
        return;
    }
    renderNews(res.articles)
}

function renderNews(news) {
    const newsContainer = document.querySelector('.news-container .row');
    if (newsContainer.children.length) {
        clearContainer(newsContainer);
    }
    let fragment = '';
    news.forEach(newsItem => {
        const el = newsTemplate(newsItem);
        fragment += el;
    });
    console.log(fragment);
    newsContainer.insertAdjacentHTML('afterbegin', fragment);
}
function newsTemplate({ urlToImage, title, url, description }) {

    return `
    <div>
    <div class="col s12">
        <div class="card">
            <div class="card-image">
                <img src="${urlToImage || 'https://schastievkadre.ru/wp-content/uploads/2018/11/blog-1-2000x1125.jpg'}">
                <span class="card-title">${title || ''}</span>
            </div>
            <div class="card-content">
                <p>${description || ''}</p>
            </div>
            <div class="card-action">
                <a href="${url}'}">Read more</a>
            </div>
        </div>
    </div>
    </div>
    `
}

function showMessage(msg, type = 'success') {
    M.toast({ html: msg, classes: type });

}
function clearContainer(container) {
    let child = container.lastElementChild;
    while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}

function showLoader() {
    document.body.insertAdjacentHTML(
        'afterbegin',
        `<div class ="progress">
            <div class="indeterminate"></div>
        </div>
        `
    );
}
function removeLoader() {
    const loader = document.querySelector('.progress');
    if (loader) {
        loader.remove();
    }
}