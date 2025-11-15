(function(){
    const btn = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primary-navigation');
    const navUnderline = document.querySelector('.nav-underline');
    const navLinks = nav ? Array.from(nav.querySelectorAll('a')) : [];

    if(!btn || !nav) return;

    btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        nav.classList.toggle('show');
    });

    function moveUnderlineToLink(link){
        if(!navUnderline || !link) return;

        const left = link.offsetLeft;
        const width = link.offsetWidth;
        const top = link.offsetTop + link.offsetHeight + 8;

        navUnderline.style.width = `${Math.round(width)}px`;
        navUnderline.style.transform = `translateX(${Math.round(left)}px)`;
        navUnderline.style.top = `${Math.round(top)}px`;
        navUnderline.style.bottom = 'auto';
        navUnderline.style.opacity = '1';
    }

    // Set active link based on current path
    function applyActiveByLocation(){
        const path = window.location.pathname.replace(/\\/g,'/');
        const current = navLinks.find(a => {
            const href = a.getAttribute('href');
            return path.endsWith(href.replace('./','').replace('../','')) || path.endsWith(href);
        });
        navLinks.forEach(a=>a.classList.remove('active'));
        if(current) current.classList.add('active');
        return current;
    }

    // On load, set underline to active item
    function initUnderline(){
        const active = applyActiveByLocation();
        if(active){
            requestAnimationFrame(()=> moveUnderlineToLink(active));
        } else {
            if(navUnderline) navUnderline.style.width='0';
        }
    }

    navLinks.forEach(link=>{
        link.addEventListener('mouseenter', (e)=> moveUnderlineToLink(e.currentTarget));
        link.addEventListener('focus', (e)=> moveUnderlineToLink(e.currentTarget));
    });

    nav.addEventListener('mouseleave', ()=>{
        const active = nav.querySelector('a.active');
        if(active) moveUnderlineToLink(active);
    });

    window.addEventListener('resize', ()=>{
        const active = nav.querySelector('a.active');
        if(active) moveUnderlineToLink(active);
    });

    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape'){
            nav.classList.remove('show');
            btn.setAttribute('aria-expanded','false');
        }
    });

    nav.addEventListener('click', (e) => {
        const target = e.target.closest('a');
        if(!target) return;
        if(nav.contains(target)){
            nav.classList.remove('show');
            btn.setAttribute('aria-expanded','false');
        }
    });

    nav.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('click', (e) => {
        if(!nav.contains(e.target) && !btn.contains(e.target)){
            nav.classList.remove('show');
            btn.setAttribute('aria-expanded','false');
        }
    });

    document.addEventListener('DOMContentLoaded', initUnderline);
    initUnderline();
})();
