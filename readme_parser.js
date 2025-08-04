document.addEventListener('DOMContentLoaded', () => {
    fetch('https://raw.githubusercontent.com/GoozyaStudio/.github/main/profile/README.md')
      .then(res => res.text())
      .then(md => {
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

          // Добавим обещание на каждую картинку
          const p = new Promise(resolve => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false); // даже если не загрузилось — продолжаем
          });
          imgPromises.push(p);
        });

        // Когда все картинки обработаны (загружены или сломались), только тогда вставим в DOM
        Promise.all(imgPromises).then(() => {
          document.getElementById('readme').innerHTML = tempDiv.innerHTML;
        });
    });
});