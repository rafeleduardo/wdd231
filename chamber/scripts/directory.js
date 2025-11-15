(async function(){
    const DATA_URL = 'data/members.json';
    const listingsEl = document.getElementById('directory-listings');
    const btnCards = document.getElementById('view-cards');
    const btnList = document.getElementById('view-list');
    const searchInput = document.getElementById('directory-search');

    let members = [];
    let currentView = 'cards'; // default

    async function fetchMembers(){
        try{
            const res = await fetch(DATA_URL);
            if(!res.ok) {
                console.error('Failed to fetch members:', res.status);
                listingsEl.innerHTML = '<p>Error loading directory data.</p>';
                return;
            }
            members = await res.json();
        } catch(err){
            console.error(err);
            listingsEl.innerHTML = '<p>Error loading directory data.</p>';
        }
    }

    function makeImage(src, alt){
        return function(opts={w:32,h:32}){
            const img = document.createElement('img');
            img.src = `images/${src}`;
            img.alt = alt || '';
            img.loading = opts.loading || 'lazy';
            if(opts.fetchpriority){
                try{ img.setAttribute('fetchpriority', opts.fetchpriority); }catch(e){}
            }
            img.width = opts.w;
            img.height = opts.h;
            img.style.objectFit = 'contain';

            const placehold = (w,h) => `https://placehold.co/${w}x${h}/0A5873/FFFFFF?text=Logo`;

            img.addEventListener('error', ()=>{
                const w = opts.w || 32;
                const h = opts.h || 32;
                const p1 = placehold(w,h);
                const p2 = placehold(w*2,h*2);
                try{ img.setAttribute('fetchpriority','high'); }catch(e){}
                img.loading = 'eager';
                img.src = p1;
                img.srcset = `${p1} 1x, ${p2} 2x`;
            });

            return img;
        };
    }

    function createCard(member, isFirst=false){
        const div = document.createElement('article');
        div.className = 'member-card';

        const media = document.createElement('div');
        media.className = 'card-media';
        const imgOpts = {w:600,h:350};
        if(isFirst){
            imgOpts.loading = 'eager';
            imgOpts.fetchpriority = 'high';

            try{
                const preloadUrl = `images/${member.image}`;
                if(!document.querySelector(`link[rel="preload"][href="${preloadUrl}"]`)){
                    const l = document.createElement('link');
                    l.rel = 'preload'; l.as = 'image'; l.href = preloadUrl;
                    document.head.appendChild(l);
                }
                const p1 = `https://placehold.co/${imgOpts.w}x${imgOpts.h}/0A5873/FFFFFF?text=Logo`;
                const p2 = `https://placehold.co/${imgOpts.w*2}x${imgOpts.h*2}/0A5873/FFFFFF?text=Logo`;
                if(!document.querySelector(`link[rel="preload"][href="${p1}"]`)){
                    const lp1 = document.createElement('link'); lp1.rel='preload'; lp1.as='image'; lp1.href=p1; document.head.appendChild(lp1);
                }
                if(!document.querySelector(`link[rel="preload"][href="${p2}"]`)){
                    const lp2 = document.createElement('link'); lp2.rel='preload'; lp2.as='image'; lp2.href=p2; document.head.appendChild(lp2);
                }
            }catch(e){/* silent */}
        }
        const img = makeImage(member.image, member.name)(imgOpts);
        media.appendChild(img);

        const body = document.createElement('div');
        body.className = 'card-body';

        const h3 = document.createElement('h3');
        h3.className = 'member-name';
        h3.textContent = member.name;

        const cat = document.createElement('p');
        cat.className = 'member-category';
        cat.innerHTML = `${member.category} &middot; ${membershipLabel(member.membership_level)}`;

        const desc = document.createElement('p');
        desc.className = 'member-desc';
        desc.textContent = member.description;

        const contact = document.createElement('p');
        contact.className = 'member-contact';
        contact.innerHTML = `${member.address}<br><a href="tel:${member.phone}">${member.phone}</a>`;

        const links = document.createElement('p');
        links.className = 'member-links';
        links.innerHTML = member.websites.map(w => `<a href="${w}" target="_blank" rel="noopener">${displayDomain(w)}</a>`).join(' | ');

        body.appendChild(h3);
        body.appendChild(cat);
        body.appendChild(desc);
        body.appendChild(contact);
        body.appendChild(links);

        div.appendChild(media);
        div.appendChild(body);
        return div;
    }

    function createListItem(member, isFirst=false){
        const wrapper = document.createElement('div');
        wrapper.className = 'member-list-item';

        const media = document.createElement('div');
        media.className = 'list-media';
        const imgOpts = {w:64,h:64};
        if(isFirst){ imgOpts.loading='eager'; imgOpts.fetchpriority='high';
            const preloadUrl = `images/${member.image}`;
            if(!document.querySelector(`link[rel="preload"][href="${preloadUrl}"]`)){
                const l = document.createElement('link'); l.rel='preload'; l.as='image'; l.href=preloadUrl; document.head.appendChild(l);
            }
        }
        const img = makeImage(member.image, member.name)(imgOpts);
        media.appendChild(img);

        const body = document.createElement('div');
        body.className = 'list-body';
        const h3 = document.createElement('h3');
        h3.innerHTML = `${member.name} <small class="muted">&middot; ${membershipLabel(member.membership_level)}</small>`;
        const meta = document.createElement('p');
        meta.className = 'muted';
        meta.textContent = `${member.category} — ${member.address}`;
        const desc = document.createElement('p');
        desc.textContent = member.description;

        body.appendChild(h3);
        body.appendChild(meta);
        body.appendChild(desc);

        wrapper.appendChild(media);
        wrapper.appendChild(body);
        return wrapper;
    }

    function membershipLabel(level){
        switch(level){
            case 3: return 'Gold';
            case 2: return 'Silver';
            default: return 'Member';
        }
    }

    function displayDomain(url){
        try{ const u = new URL(url); return u.hostname.replace('www.',''); }catch(e){return url}
    }

    function render(filtered){
        const frag = document.createDocumentFragment();
        if(currentView === 'cards'){
            const grid = document.createElement('div');
            grid.className = 'cards-grid';
            filtered.forEach((m,i) => grid.appendChild(createCard(m, i===0)));
            frag.appendChild(grid);
        } else {
            const list = document.createElement('div');
            list.className = 'list-wrap';
            filtered.forEach((m,i) => list.appendChild(createListItem(m, i===0)));
            frag.appendChild(list);
        }

        listingsEl.innerHTML = '';
        listingsEl.appendChild(frag);

        listingsEl.classList.remove('loading');
        listingsEl.removeAttribute('aria-busy');
        listingsEl.classList.remove('directory-cards','directory-list');
        listingsEl.classList.add(currentView === 'cards' ? 'directory-cards' : 'directory-list');
    }

    function applySearch(){
        const q = (searchInput.value || '').toLowerCase().trim();
        if(!q) return members.slice();
        return members.filter(m => (
            m.name.toLowerCase().includes(q) ||
            (m.category && m.category.toLowerCase().includes(q)) ||
            (m.services && m.services.join(' ').toLowerCase().includes(q))
        ));
    }

    btnCards.addEventListener('click', ()=>{
        currentView = 'cards';
        btnCards.classList.add('active'); btnCards.setAttribute('aria-pressed','true');
        btnList.classList.remove('active'); btnList.setAttribute('aria-pressed','false');
        render(applySearch());
    });
    btnList.addEventListener('click', ()=>{
        currentView = 'list';
        btnList.classList.add('active'); btnList.setAttribute('aria-pressed','true');
        btnCards.classList.remove('active'); btnCards.setAttribute('aria-pressed','false');
        render(applySearch());
    });

    searchInput.addEventListener('input', ()=>{
        render(applySearch());
    });

    // init
    await fetchMembers();
    render(members);
})();
