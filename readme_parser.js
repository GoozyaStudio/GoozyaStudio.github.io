document.addEventListener('DOMContentLoaded', () => {
    const UPDATE_HOUR = 19; // час обновления по cron (UTC или твоему времени)
    const now = new Date();
    const lastUpdateStr = localStorage.getItem('readme_last_check');
    const lastUpdate = lastUpdateStr ? new Date(lastUpdateStr) : null;

    let needUpdate = false;

    if (!lastUpdate) {
        // Если ещё не было загрузок
        needUpdate = true;
    } else {
        // Определяем дату "следующего обновления" после lastUpdate
        let nextUpdate = new Date(lastUpdate);
        nextUpdate.setHours(UPDATE_HOUR, 0, 0, 0);

        // Если lastUpdate было до 19:00 того дня — обновление уже в тот же день
        if (lastUpdate.getHours() < UPDATE_HOUR) {
            nextUpdate.setHours(UPDATE_HOUR, 0, 0, 0);
        } else {
            // Иначе на следующий день
            nextUpdate.setDate(nextUpdate.getDate() + 1);
        }

        // Если текущее время >= времени следующего обновления — пора качать
        if (now >= nextUpdate) {
            needUpdate = true;
        }
    }

    const url = 'https://raw.githubusercontent.com/GoozyaStudio/.github/main/profile/README.md';

    fetch(url, { cache: needUpdate ? "no-cache" : "default" })
        .then(res => res.text())
        .then(md => {
            if (needUpdate) {
                localStorage.setItem('readme_last_check', now.toISOString());
            }

            const htmlRaw = marked.parse(md);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlRaw;

            const profileBase = 'https://raw.githubusercontent.com/GoozyaStudio/.github/main/profile/';
            const rootBase = 'https://raw.githubusercontent.com/GoozyaStudio/.github/main/';

            const imgPromises = [];

            tempDiv.querySelectorAll('img').forEach(img => {
                const src = img.getAttribute('src');
                if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                    let finalSrc;
                    if (src.startsWith('../')) {
                        finalSrc = rootBase + src.slice(3);
                    } else if (src.startsWith('./')) {
                        finalSrc = profileBase + src.slice(2);
                    } else {
                        finalSrc = profileBase + src;
                    }
                    img.src = finalSrc;
                }

                const p = new Promise(resolve => {
                    img.onload = () => resolve(true);
                    img.onerror = () => resolve(false);
                });
                imgPromises.push(p);
            });

            Promise.all(imgPromises).then(() => {
                document.getElementById('readme').innerHTML = tempDiv.innerHTML;
            });
        });
});
