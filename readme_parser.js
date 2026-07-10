document.addEventListener('DOMContentLoaded', () => {

    const url = 'https://api.github.com/repos/GoozyaStudio/.github/contents/profile/README.md';

    const renderMarkdown = (md) => {
        const htmlRaw = marked.parse(md);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlRaw;

        const profileBase =
            'https://raw.githubusercontent.com/GoozyaStudio/.github/main/profile/';

        const rootBase =
            'https://raw.githubusercontent.com/GoozyaStudio/.github/main/';


        tempDiv.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src');

            if (src && !src.startsWith('http') && !src.startsWith('data:')) {

                if (src.startsWith('../')) {
                    img.src = rootBase + src.slice(3);

                } else if (src.startsWith('./')) {
                    img.src = profileBase + src.slice(2);

                } else {
                    img.src = profileBase + src;
                }
            }

            img.loading = 'lazy';
        });


        document.getElementById('readme').innerHTML = tempDiv.innerHTML;
    }


    // Загружаем сохраненный README сразу
    const cachedReadme = localStorage.getItem('readme_cache');

    if (cachedReadme) {
        renderMarkdown(cachedReadme);
    }


    // Старый ETag
    const oldETag = localStorage.getItem('readme_etag');


    const headers = {
        'Accept': 'application/vnd.github+json'
    };


    if (oldETag) {
        headers['If-None-Match'] = oldETag;
    }


    fetch(url, {
        headers: headers,
        cache: 'no-cache'
    })

    .then(response => {

        // README не менялся
        if (response.status === 304) {
            return null;
        }


        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }


        // сохраняем новый ETag
        const newETag = response.headers.get('etag');

        if (newETag) {
            localStorage.setItem('readme_etag', newETag);
        }


        return response.json();
    })


    .then(data => {

        // был 304
        if (!data) {
            return;
        }


        const bytes = Uint8Array.from(
            atob(data.content.replace(/\n/g, '')),
            c => c.charCodeAt(0)
        );


        const md = new TextDecoder('utf-8').decode(bytes);


        localStorage.setItem('readme_cache', md);


        renderMarkdown(md);

    })


    .catch(err => {

        console.error(err);

        if (!cachedReadme) {
            document.getElementById('readme').textContent =
                'Ошибка загрузки README';
        }

    });

});